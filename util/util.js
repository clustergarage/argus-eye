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

export const tagsToObject = tags => {
  const arr = tags.split(',')
  let obj = {}
  for (let i = 0; i < arr.length; ++i) {
    let [key, value] = arr[i].split('=')
    if (key && value) {
      obj[key] = value
    }
  }
  return obj
}
