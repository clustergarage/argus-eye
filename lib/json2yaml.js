export const json2yaml = obj => {
  const spacing = '  '

  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }

  const getType = obj => {
    var type = typeof obj
    if (obj instanceof Array) {
      return 'array'
    } else if (type === 'string') {
      return 'string'
    } else if (type === 'boolean') {
      return 'boolean'
    } else if (type === 'number') {
      return 'number'
    } else if (type === 'undefined' || obj === null) {
      return 'null'
    } else {
      return 'hash'
    }
  }

  const normalizeString = str => {
    if (str.match(/^[\w]+$/)) {
      return str
    } else {
      return str.replace(/%u/g, '\\u')
        .replace(/%U/g, '\\U')
        .replace(/%/g, '\\x')
    }
  }

  const convertString = (obj, ret) => {
    ret.push(normalizeString(obj))
  }

  const convertArray = (obj, ret) => {
    //if (obj.length === 0) {
    //  ret.push('[]')
    //}
    for (let i = 0; i < obj.length; ++i) {
      let ele = obj[i]
      let recurse = []
      convert(ele, recurse)

      for (let j = 0; j < recurse.length; ++j) {
        ret.push((j === 0 ? '- ' : spacing) + recurse[j])
      }
    }
  }

  const convertHash = (obj, ret) => {
    for (let k in obj) {
      let recurse = []
      if (obj.hasOwnProperty(k)) {
        let ele = obj[k]
        convert(ele, recurse)

        let type = getType(ele)
        if (type === 'string' ||
          type === 'null' ||
          type === 'number' ||
          type === 'boolean') {
          ret.push(normalizeString(k) + ': ' +  recurse[0])
        } else {
          ret.push(normalizeString(k) + ': ')
          for (let i = 0; i < recurse.length; ++i) {
            ret.push((type === 'array' ? '' : spacing) + recurse[i])
          }
        }
      }
    }
  }

  const convert = (obj, ret) => {
    var type = getType(obj)
    switch (type) {
      case 'array':
        convertArray(obj, ret)
        break
      case 'hash':
        convertHash(obj, ret)
        break
      case 'string':
        convertString(obj, ret)
        break
      case 'null':
        ret.push('null')
        break
      case 'number':
        ret.push(obj.toString())
        break
      case 'boolean':
        ret.push(obj ? 'true' : 'false')
        break
    }
  }

  let ret = []
  convert(obj, ret)
  return ret.join('\n')
}
