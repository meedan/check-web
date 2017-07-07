import path from 'path';
import webpack from 'webpack';
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CompressionPlugin = require('compression-webpack-plugin');


export default {
  bail: true, // exit 1 on build failure
  entryWeb: {
    index: ['babel-polyfill', 'whatwg-fetch', path.join(__dirname, '../src/web/index/index')]
  },
  entryServer: {
    index: ['babel-polyfill', 'whatwg-fetch', path.join(__dirname, '../server/server.js')]
  },
  output: {
    pathWeb: path.join(__dirname, '../build/web/js'),
    pathServer: path.join(__dirname, '../dist'),
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
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    // Uncomment to see at localhost:8888 a treemap of modules included in the bundle
    // new BundleAnalyzerPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => /node_modules/.test(module.resource)
    }),
    new webpack.IgnorePlugin(/jsdom$/)
  ],
  resolve: {
    alias: { app: path.join(__dirname, '../src/app') },
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: [path.join(__dirname, './babelRelayPlugin.js')]
        }
      }, {
        test: /\.css?$/,
        loaders: ['style', 'raw']
      }]
  },
  externals: {
    'config': 'config',
    'pusher-js': 'Pusher'
  }
};
