const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const locales = require('../localization/translations/locales');

// For ContextReplacementPlugin: pattern for dynamic-import filenames.
// matches "/es.js" and "/es.json".
// Doesn't match "messages-ru-TeamRules.json".
const localesRegExp = new RegExp(`/(${locales.join('|')})$`);

const NODE_ENV = process.env.NODE_ENV || 'production';

module.exports = {
  bail: true, // exit 1 on build failure
  entry: {
    index: [ 'whatwg-fetch', path.join(__dirname, '../src/web/index/index') ]
  },
  output: {
    path: path.join(__dirname, '../build/web/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
    new webpack.ContextReplacementPlugin(/react-intl\/locale-data/, localesRegExp),
    new webpack.ContextReplacementPlugin(/localization\/translations/, localesRegExp),
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
    extensions: ['.js', '.json']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { browsers: '> 0.5%, not IE 11' },
              useBuiltIns: 'usage',
            }
          ],
          '@babel/preset-react',
        ],
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-object-rest-spread',
          [
            'relay',
            {
              compat: true,
              schema: path.resolve(__dirname, '../relay.json'),
            }
          ],
          ['react-intl', { 'messagesDir': path.resolve(__dirname, '../localization/react-intl/') }],
        ],
        cacheDirectory: true,
        cacheIdentifier: JSON.stringify({
          NODE_ENV: NODE_ENV,
          'package-lock.json': require('../package-lock.json'),
          'webpack/config.js': fs.readFileSync(__filename),
        }),
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
    }]
  },
  externals: {
    'config': 'config',
    'pusher-js': 'Pusher'
  }
};
