export const formatPath = path => {
  return '/' + path.split('/')
    .slice(4) // [][proc][<pid>][root]
    .join('/')
}
