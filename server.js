const express = require('express'),
  next = require('next'),
  assert = require('assert'),
  //bodyParser = require('body-parser'),
  fs = require('fs'),
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
				return new Promise(function(resolve, reject) {
					fs.readFile(file, function(err, buf) {
						let ret = false
						if (err) {
							reject(err)
							return
						}
						for (let i = 0, len = buf.length; i < len; ++i) {
							if (buf[i] > 127) {
								ret = true
								break
							}
						}
						resolve(ret)
					})
				})
			}

      const walk = (dir, done) => {
        let results = []
        let obj = {path: dir}

        fs.readdir(dir, (err, list) => {
          let i = 0
          if (err) {
            return done(err)
          }

          const next = (ob) => {
            let file = list[i++]
            if (!file) {
              return done(null, results)
            }
            let fullpath = dir + '/' + file

            fs.stat(fullpath, (err, stat) => {
							if (!stat ||
								// skip dev,sys,proc directories via inode check
								(stat.ino == 1 || stat.ino == 2)) {
								next(ob)
							} else {
								ob = {
									name: file,
									path: fullpath,
									isDir: stat.isDirectory(),
								}
								if (stat.isFile()) {
									isBinary(fullpath)
										.then(binary => ob.isBinary = binary)
										.catch(console.error)
								}
								results.push(ob)
								next(ob)
							}
            })
          }
          next(obj)
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
