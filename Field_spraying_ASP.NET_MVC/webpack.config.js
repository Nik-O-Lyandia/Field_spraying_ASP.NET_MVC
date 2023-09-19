const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: './wwwroot/js/site.js',
  output: {
    path: __dirname,
    filename: './wwwroot/js/bundle.js'
  },
};
