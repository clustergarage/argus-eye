const express = require('express'),
  next = require('next'),
  assert = require('assert'),
  //bodyParser = require('body-parser'),
  fs = require('fs'),
  isBinaryFile = require("isbinaryfile"),
  k8s = require('@kubernetes/client-node'),
  dockerode = require('dockerode')

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

const kc = new k8s.KubeConfig()
kc.loadFromDefault()
const k8sApi = kc.makeApiClient(k8s.Core_v1Api)
const docker = new dockerode({socketPath: '/var/run/docker.sock'})

app.prepare()
  .then(() => {
    const server = express()
    //server.use(bodyParser.urlencoded({extended: true}))
    //server.use(bodyParser.json())

    server.get('/k8s/pods/:selector', (req, res) => {
      assert(req.params.selector)
      k8sApi.listPodForAllNamespaces(null, null, null, req.params.selector)
        .then((result) => res.send(result.body))
    })

    server.get('/k8s/:namespace/pod/:name/containers', (req, res) => {
      assert(req.params.namespace)
      assert(req.params.name)
      k8sApi.readNamespacedPod(req.params.name, req.params.namespace)
        .then((result) => res.send(result.body))
    })

    server.get('/docker/container/:id/pid', (req, res) => {
      assert(req.params.id)
      const container = docker.getContainer(req.params.id)
      container.inspect((err, data) => res.send(`${data.State.Pid}`))
    })

    server.get('/fs', (req, res) => {
      assert(req.query.directory)

      const isBinary = file => {
        return new Promise((resolve, reject) => {
          fs.readFile(file, (err, buf) => {
            fs.lstat(file, (err, stat) => {
              isBinaryFile(buf, stat.size, (err, result) => {
                if (err) {
                  reject(err)
                  return
                }
                resolve(result)
              });
            });
          })
        })
      }

      const locateLink = path => {
        return new Promise((resolve, reject) => {
          fs.readlink(path, (err, targetpath) => resolve(targetpath))
        })
      }

      const walk = (dir, done) => {
        let results = []
        let result = {path: dir}

        fs.readdir(dir, (err, list) => {
          let i = 0
          if (err) {
            return done(err)
          }

          const next = (res) => {
            let file = list[i++]
            if (!file) {
              return done(null, results)
            }
            let fullpath = dir + '/' + file

            fs.lstat(fullpath, (err, stat) => {
              res = {
                name: file,
                path: fullpath,
                isDir: stat.isDirectory(),
                isSymlink: stat.isSymbolicLink(),
                isWatchable: !!(stat.ino > 100), // @TODO: find the real number
              }
              if (stat.isFile()) {
                isBinary(fullpath)
                  .then(binary => res.isBinary = binary)
                  .catch(console.error)
              }
              if (stat.isSymbolicLink()) {
                locateLink(fullpath)
                  .then(targetpath => res.targetPath = targetpath)
                  .catch(console.error)
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

    server.listen(3000, (err) => {
      if (err) {
        throw err
      }
      console.log('> Ready on http://localhost:3000')
    })
  })
  .catch((e) => {
    console.error(e.stack)
    process.exit(1)
  })
