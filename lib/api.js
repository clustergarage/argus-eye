import fetch from 'isomorphic-unfetch'

export const searchPods = async value => {
  const res = await fetch(`/k8s/pods/${value}`)
  const json = await res.json()
  return json.items
}

export const podContainers = async (namespace, name) => {
  const res = await fetch(`/k8s/${namespace}/pod/${name}/containers`)
  const json = await res.json()
  return json.status.containerStatuses
}

export const applyArgusWatcher = async (namespace, name, json) => {
  const res = await fetch(`/k8s/${namespace}/arguswatcher/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  })
  return res.json()
}

export const listArgusWatchers = async req => {
  const baseUrl = req ? `${req.protocol}://${req.headers.host}` : '';
  const res = await fetch(`${baseUrl}/k8s/arguswatchers`)
  const json = await res.json()
  return json.items
}

export const containerPID = async id => {
  id = id.substring(id.lastIndexOf('://') + 3, id.length)
  const res = await fetch(`/docker/container/${id}/pid`)
  return res.json()
}

export const loadFSTree = async directory => {
  const res = await fetch(`/fs?directory=${directory}`)
  return res.json()
}
