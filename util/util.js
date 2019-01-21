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
  let obj = {}
  tags.replace(/([^=\,]+)=([^\,]*)/g, (_, k, v) => obj[k] = v)
  return obj
}

export const containsAll = (haystack, needles) => {
  for (let i = 0; i < needles.length; ++i) {
    if (haystack.indexOf(needles[i]) === -1) {
      return false
    }
  }
  return true
}
