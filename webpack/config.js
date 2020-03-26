const path = require('path');
const webpack = require('webpack');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const locales = require(path.join(__dirname, '../localization/translations/locales.js'));

const localesRegExp = new RegExp('\/(' + locales.join('|') + ')\.js$');

const NODE_ENV = process.env.NODE_ENV || 'production';

module.exports = {
  bail: true, // exit 1 on build failure
  entry: {
    index: [ 'whatwg-fetch', path.join(__dirname, '../src/web/index/index') ]
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
    // TODO upgrade to Webpack 5, which derives "minify" from mode (dev/prod)
  ].concat(NODE_ENV === 'production' ? [new webpack.optimize.UglifyJsPlugin({sourceMap: true})] : []),
  resolve: {
    alias: {app: path.join(__dirname, '../src/app')},
    extensions: ['.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: [
          [
            'env',
            {
              targets: { browsers: '> 0.5%, not IE 11' },
              useBuiltins: 'usage',
            }
          ],
          'react',
        ],
        plugins: [
          'syntax-dynamic-import',
          'transform-class-properties',
          'transform-object-rest-spread',
          [
            'relay',
            {
              compat: true,
              schema: path.resolve(__dirname, '../relay.json'),
            }
          ],
        ],
      },
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
