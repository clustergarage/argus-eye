const withCSS = require('@zeit/next-css')

module.exports = withCSS({
  cssModules: true,
  //webpack: function(config) {
  //  return config
  //},
})
