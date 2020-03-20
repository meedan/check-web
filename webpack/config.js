import path from 'path';
import webpack from 'webpack';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const locales = require(path.join(__dirname, '../localization/translations/locales.js'));

const localesRegExp = new RegExp('\/(' + locales.join('|') + ')\.js$');

const NODE_ENV = process.env.NODE_ENV || 'production';

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
  watchOptions: {
    ignored: /node_modules/,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      __DEVELOPMENT__: NODE_ENV != 'production',
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => /node_modules/.test(module.resource)
    }),
  ].concat(NODE_ENV == 'production' ? [
    // TODO upgrade to Webpack 5, which derives "minify" from mode (dev/prod)
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true,
      comments: false,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
  ] : []),
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
