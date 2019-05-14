import path from 'path';
import webpack from 'webpack';
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CompressionPlugin = require('compression-webpack-plugin');
var locales = require(path.join(__dirname, '../localization/translations/locales.js'));

const localesRegExp = new RegExp('\/(' + locales.join('|') + ')\.js$');

export default {
  bail: true, // exit 1 on build failure
  entry: {
    index: [ 'babel-polyfill', 'whatwg-fetch', path.join(__dirname, '../src/web/index/index') ]
  },
  output: {
    path: path.join(__dirname, '../build/web/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      },
      __DEVELOPMENT__: false
    }),
    new webpack.ContextReplacementPlugin(
      /react-intl\/locale-data/,
      localesRegExp,
    ),
    new webpack.ContextReplacementPlugin(
      /localization\/translations/,
      localesRegExp,
    ),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 5000,
      minRatio: 0.8
    }),
    // Uncomment to see at localhost:8888 a treemap of modules included in the bundle
    // new BundleAnalyzerPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true,
      comments: false,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => /node_modules/.test(module.resource)
    })
  ],
  resolve: {
    alias: {app: path.join(__dirname, '../src/app')},
    extensions: ['.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: { presets: ['es2015', 'stage-0', 'react'], plugins: [path.join(__dirname, './babelRelayPlugin.js')]}
    }, {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
      include: [
        path.join(__dirname, '../src/app')
      ]
    }, {
      test: /\.css?$/,
      use: ['style-loader', 'raw-loader']
    }, {
      test: /\.json$/,
      loader: 'ignore-loader'
    }]
  },
  externals: {
    'config': 'config',
    'pusher-js': 'Pusher'
  }
};
