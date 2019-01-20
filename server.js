const express = require('express'),
  next = require('next'),
  assert = require('assert'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  isBinaryFile = require("isbinaryfile"),
  k8s = require('@kubernetes/client-node'),
  dockerode = require('dockerode')

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()
// @TODO: add other container runtimes
const docker = new dockerode({socketPath: '/var/run/docker.sock'})

// @FIXME: https://github.com/kubernetes-client/javascript/issues/19
// until this is fixed, the patch* commands are not setting the proper headers
class K8sCustomObjectsApi extends k8s.Custom_objectsApi {
  patchNamespacedCustomObject(...args) {
    const oldDefaultHeaders = this.defaultHeaders;
    this.defaultHeaders = {
      'Content-Type': 'application/merge-patch+json',
      ...this.defaultHeaders,
    };
    const returnValue = super.patchNamespacedCustomObject.apply(this, args);
    this.defaultHeaders = oldDefaultHeaders;
    return returnValue;
  }
}

const kc = new k8s.KubeConfig()
kc.loadFromDefault()
const k8sApi = kc.makeApiClient(k8s.Core_v1Api)
const k8sCustomApi = kc.makeApiClient(K8sCustomObjectsApi/*k8s.Custom_objectsApi*/)

const ARGUSWATCHER_GROUP = 'arguscontroller.clustergarage.io'
const ARGUSWATCHER_VERSION = 'v1alpha1'
const ARGUSWATCHER_RESOURCE = 'arguswatchers'

app.prepare()
  .then(() => {
    const server = express()
    server.use(bodyParser.urlencoded({extended: true}))
    server.use(bodyParser.json())

    server.get('/k8s/pods/:selector', (req, res) => {
      assert(req.params.selector)
      k8sApi.listPodForAllNamespaces(null, null, null, req.params.selector)
        .then(result => res.send(result.body))
    })

    server.get('/k8s/:namespace/pod/:name/containers', (req, res) => {
      assert(req.params.namespace)
      assert(req.params.name)
      k8sApi.readNamespacedPod(req.params.name, req.params.namespace)
        .then(result => res.send(result.body))
    })

    server.post('/k8s/:namespace/arguswatcher/:name', (req, res) => {
      assert(req.params.namespace)
      assert(req.params.name)
      const namespace = req.params.namespace
      const name = req.params.name

      // try to get existing arguswatcher in namespace/name form
      k8sCustomApi.getNamespacedCustomObject(ARGUSWATCHER_GROUP, ARGUSWATCHER_VERSION,
        namespace, ARGUSWATCHER_RESOURCE, name)
        .then(response => {
          // existing object needs to be patched
          k8sCustomApi.patchNamespacedCustomObject(ARGUSWATCHER_GROUP, ARGUSWATCHER_VERSION,
            namespace, ARGUSWATCHER_RESOURCE, name, req.body)
            .then(result => res.send(result.body))
            .catch(e => console.error(e.body))
        }, reject => {
          if (reject.body.reason === 'NotFound') {
            // no object with this name exists, create new object
            k8sCustomApi.createNamespacedCustomObject(ARGUSWATCHER_GROUP, ARGUSWATCHER_VERSION,
              namespace, ARGUSWATCHER_RESOURCE, req.body)
              .then(result => res.send(result.body))
              .catch(e => console.error(e.body))
          }
        })
        .catch(e => console.error(e))
    })

    server.get('/docker/container/:id/pid', (req, res) => {
      assert(req.params.id)
      const container = docker.getContainer(req.params.id)
      container.inspect((err, data) => res.send(`${data.State.Pid}`))
    })

    server.get('/fs', async (req, res) => {
      assert(req.query.directory)

      const walk = (dir, done) => {
        let results = []
        let result = {path: dir}

        fs.readdir(dir, (err, list) => {
          let i = 0
          if (err) {
            return done(err)
          }

          const next = res => {
            let file = list[i++]
            if (!file) {
              return done(null, results)
            }
            let fullpath = dir + '/' + file

            fs.lstat(fullpath, (err, stat) => {
              res = {
                name: file,
                path: fullpath,
                isDirectory: stat.isDirectory(),
                isSymlink: stat.isSymbolicLink(),
                // source: https://ext4.wiki.kernel.org/index.php/Ext4_Disk_Layout#Special_inodes
                isDisabled: !!(stat.ino < 12),
              }
              if (stat.isSymbolicLink()) {
                res.targetPath = fs.readlinkSync(fullpath)
              } else if (stat.isFile()) {
                res.isBinary = isBinaryFile.sync(fullpath)
              }
              results.push(res)
              next(res)
            })
          }
          next(result)
        })
      }

      walk(req.query.directory, (err, results) => res.send(results))
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(3000, err => {
      if (err) {
        throw err
      }
      console.log('Listening on http://localhost:3000')
    })
  })
  .catch(e => {
    console.error(e.stack)
    process.exit(1)
  })
