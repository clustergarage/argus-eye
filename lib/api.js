import fetch from 'isomorphic-unfetch'

export const searchPods = async (value) => {
  const res = await fetch(`/k8s/pods/${value}`)
  const json = await res.json()
  return json.items
}

export const podContainers = async (namespace, name) => {
  const res = await fetch(`/k8s/${namespace}/pod/${name}/containers`)
  const json = await res.json()
  return json.status.containerStatuses
}

export const containerPID = async (id) => {
  id = id.substring(id.lastIndexOf('://') + 3, id.length)
  const res = await fetch(`/docker/container/${id}/pid`)
  return res.json()
}

export const loadFSTree = async (directory) => {
  const res = await fetch(`/fs?directory=${directory}`)
  return res.json()
}
