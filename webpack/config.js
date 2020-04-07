const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const locales = require('../localization/translations/locales');
const zlib = require('zlib');

// For ContextReplacementPlugin: pattern for dynamic-import filenames.
// matches "/es.js" and "/es.json".
// Doesn't match "messages-ru-TeamRules.json".
const localesRegExp = new RegExp(`/(${locales.join('|')})$`);

const NODE_ENV = process.env.NODE_ENV || 'production';

const nodeModulesPrefix = path.resolve(__dirname, '../node_modules') + '/';
const reactIntlLocaleDataPrefix = `${nodeModulesPrefix}react-intl/locale-data/`;

// This export may be mangled by the caller: either gulpfile.js, or
// `webpack` command-line parameters.
module.exports = {
  bail: true, // crash on error
  entry: {
    index: [ 'whatwg-fetch', path.join(__dirname, '../src/web/index/index') ]
  },
  devtool: NODE_ENV === 'production' ? 'source-map' : 'eval-cheap-module-source-map',
  output: {
    path: path.join(__dirname, '../build/web/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  optimization: {
    splitChunks: {
      // do not auto-split.
      // Override with "enforce" (`vendor` chunk below) or comments above
      // import() directives (`react-intl/locale-data/*.js` and
      // `localization/translations/*.js`).
      minSize: 999999999,
      // do not auto-name chunks.
      // Recommended in Webpack docs so names in dev/prod stay predictable.
      // https://webpack.js.org/plugins/split-chunks-plugin/#splitchunksname
      name: false,
      cacheGroups: {
        // "vendor.chunk.js" chunk.
        vendor: {
          name: 'vendor',
          filename: 'vendor.bundle.js', // we link to it directly in our HTML
          chunks: 'all',
          enforce: true,
          test({ resource }) {
            return (
              resource
              && resource.startsWith(nodeModulesPrefix)
              && !resource.startsWith(reactIntlLocaleDataPrefix)
            );
          }
        }
      }
    }
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/react-intl\/locale-data/, localesRegExp),
    new webpack.ContextReplacementPlugin(/localization\/translations/, localesRegExp),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      compressionOptions: {
        level: NODE_ENV === 'production' ? zlib.Z_BEST_COMPRESSION : zlib.Z_NO_COMPRESSION,
      },
      test: /\.js$|\.css$|\.html$/,
      threshold: 5000,
      minRatio: 0.8
    }),
  ],
  resolve: {
    alias: {app: path.join(__dirname, '../src/app')},
    extensions: ['.js', '.json']
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { browsers: '> 0.5%, not IE 11' },
              useBuiltIns: 'usage',
              corejs: 3,
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
