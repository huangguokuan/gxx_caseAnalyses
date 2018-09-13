const webpack = require('webpack');
const path = require('path');
const config = require('../config');
const library = '[name]_lib';

module.exports = {
  entry: {
    vendors: ['vue','vue-router','axios','iview','echarts','babel-polyfill','es6-promise']
  },
  output: {
    filename: '[name].dll.js',
    path:process.env.NODE_ENV === 'production' ? config.build.dllPath : config.dev.dllPath,
    library
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '[name]-manifest.json'),
      name: library,
      context: __dirname
    }),
  ],
};