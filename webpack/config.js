const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const UnusedFilesWebpackPlugin = require('unused-files-webpack-plugin').default;
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin');
// TODO once we reach react-relay 8.0, uncomment for simpler build end.
// (Also, delete the relay-compiler stuff form gulpfile.)
// const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');
const locales = require('../localization/translations/locales');
const zlib = require('zlib');

// For ContextReplacementPlugin: pattern for dynamic-import filenames.
// matches "/es.js" and "/es.json".
// Doesn't match "messages-ru-TeamRules.json".
const localesRegExp = new RegExp(`/(${locales.join('|')})$`);

const NODE_ENV = process.env.NODE_ENV || 'production';
const BUNDLE_PREFIX = process.env.BUNDLE_PREFIX ? `.${process.env.BUNDLE_PREFIX}` : '';

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
    filename: `[name].bundle${BUNDLE_PREFIX}.js`,
    chunkFilename: `[name].chunk${BUNDLE_PREFIX}.js`
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
          filename: `vendor.bundle${BUNDLE_PREFIX}.js`, // we link to it directly in our HTML
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
    // TODO once we reach react-relay 8.0, uncomment for simpler build env
    // (Also, delete the relay-compiler stuff form gulpfile.)
    // new RelayCompilerWebpackPlugin({
    //   schema: path.resolve(__dirname, '../relay.json'),
    //   src: path.resolve(__dirname, '../src/app'),
    // }),
    new webpack.ContextReplacementPlugin(/react-intl\/locale-data/, localesRegExp),
    new webpack.ContextReplacementPlugin(/localization\/translations/, localesRegExp),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      compressionOptions: {
        level: NODE_ENV === 'production' ? zlib.Z_BEST_COMPRESSION : zlib.Z_NO_COMPRESSION,
      },
      test: /\.js$|\.css$|\.html$/,
    }),
    new UnusedFilesWebpackPlugin({
      failOnUnused: true,
      patterns: ['src/app/**/*.js'],
    }),
    new WarningsToErrorsPlugin(),
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
        cacheDirectory: true,
        cacheIdentifier: JSON.stringify({
          NODE_ENV: NODE_ENV,
          'package-lock.json': require('../package-lock.json'),
          'webpack/config.js': fs.readFileSync(__filename),
          'src/.babelrc.json': require('../src/.babelrc.json'),
        }),
      },
    }, {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
      include: [
        path.join(__dirname, '../src/app')
      ],
      options: {
        failOnError: true,
        failOnWarning: true,
      },
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
