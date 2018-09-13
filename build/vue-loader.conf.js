const utils = require('./utils');
const config = require('../config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';
const sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap;

module.exports = {
    /*loaders: utils.cssLoaders({
        sourceMap: false,
        extract: true
    }),*/
    extractCSS: true,
    cssSourceMap: false,
    cacheBusting: config.dev.cacheBusting,
    transformToRequire: {
        video: 'src',
        source: 'src',
        img: 'src',
        image: 'xlink:href'
    }
};
