export const formatPath = path => {
  return '/' + path.split('/')
    .slice(4) // [][proc][<pid>][root]
    .join('/')
}

export const formatLabels = obj => {
  return Object.keys(obj || {})
    .map(key => `${key}=${obj[key]}`)
    .join(',')
}
