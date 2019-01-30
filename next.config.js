const withCSS = require('@zeit/next-css')
module.exports = withCSS({})

//const withOffline = require('next-offline')
//module.exports = withOffline(withCSS())

//const {
//  PHASE_DEVELOPMENT_SERVER,
//  PHASE_PRODUCTION_SERVER,
//} = require('next/constants')
//module.exports = (phase, {defaultConfig}) => withCSS({
//  exportPathMap: async function(defaultPathMap) {
//    return {
//      '/': {
//        page: '/'
//      },
//      '/export-config': {
//        page: '/export-config'
//      },
//      '/watchers': {
//        page: '/watchers'
//      },
//    }
//  }
//})
