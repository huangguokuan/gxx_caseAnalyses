const path = require('path');
const utils = require('./utils');
const config = require('../config');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin =require('optimize-css-assets-webpack-plugin');
const manifest = require('./vendors-manifest.json')
// const vueLoaderConfig = require('./vue-loader.conf');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const iviewExtract = new ExtractTextPlugin({
  filename:'src/static/css/iview-[contenthash].css',
  allChunks:true
});
const styleExtract = new ExtractTextPlugin({
  filename:'src/static/css/style-[contenthash].css',
  allChunks:true
});

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      // 'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            less: styleExtract.extract({
              use: ['css-loader', 'less-loader'],
              fallback: 'vue-style-loader'
            }),
            css: styleExtract.extract({
              use: ['css-loader'],
              fallback: 'vue-style-loader'
            })
          }
        }
      },
      {
        test:/variables\.less$/,
        use:iviewExtract.extract({
          fallback: 'vue-style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test:/^(?!variables)\.less$/,
        use:styleExtract.extract({
          fallback: 'vue-style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'),resolve('node_modules/webpack-dev-server/client'),resolve('node_modules/_iview@2.14.3@iview/src'),resolve('node_modules/iview/src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/i,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        postcss: [autoprefixer()]
      }
    }),
    iviewExtract,
    styleExtract,
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest
    }),
    new OptimizeCssAssetsPlugin()
  ]
};
