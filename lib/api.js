import fetch from 'isomorphic-unfetch'

export const searchPods = async value => {
  const res = await fetch(`/k8s/pods/${value}`)
  if (res.status >= 400) {
    return []
  }
  const json = await res.json()
  return json.items
}

export const podContainers = async (namespace, name) => {
  const res = await fetch(`/k8s/${namespace}/pod/${name}/containers`)
  if (res.status >= 400) {
    return []
  }
  const json = await res.json()
  return json.status.containerStatuses
}

export const listArgusWatchers = async () => {
  const res = await fetch(`/k8s/arguswatchers`)
  if (res.status >= 400) {
    return []
  }
  const json = await res.json()
  return json.items
}

export const applyArgusWatcher = async (namespace, name, json) => {
  const res = await fetch(`/k8s/${namespace}/arguswatcher/${name}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(json),
  })
  return res.json()
}

export const deleteArgusWatcher = async (namespace, name) => {
  const res = await fetch(`/k8s/${namespace}/arguswatcher/${name}`, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
  })
  return res.json()
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
