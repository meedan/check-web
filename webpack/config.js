const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UnusedFilesWebpackPlugin = require('unused-files-webpack-plugin').default;
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const { sentryWebpackPlugin } =  require('@sentry/webpack-plugin');
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
const BUNDLE_PREFIX = process.env.BUNDLE_PREFIX
  ? `.${process.env.BUNDLE_PREFIX}`
  : '';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;

const nodeModulesPrefix = path.resolve(__dirname, '../node_modules') + '/';
const reactIntlLocaleDataPrefix = `${nodeModulesPrefix}react-intl/locale-data/`;

// This export may be mangled by the caller: either gulpfile.js, or
// `webpack` command-line parameters.
module.exports = {
  bail: true, // crash on error
  entry: {
    index: ['whatwg-fetch', path.join(__dirname, '../src/web/index/index')],
  },
  devtool:
    NODE_ENV === 'production' ? 'source-map' : 'eval-cheap-module-source-map',
  output: {
    path: path.join(__dirname, '../build/web/js'),
    filename: `[name].bundle${BUNDLE_PREFIX}.js`,
    chunkFilename: `[name].chunk${BUNDLE_PREFIX}.[contenthash].js`,
		publicPath: '/',
  },
  watchOptions: {
    // ignore all node_modules except for those in the @meedan organization, but do ignore any node_modules that are children of the @meedan organization
    ignored: [/node_modules\/(?!@meedan\/.+)/, /\@meedan\/.+\/node_modules/],
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
              resource &&
              resource.startsWith(nodeModulesPrefix) &&
              !resource.startsWith(reactIntlLocaleDataPrefix)
            );
          },
        },
      },
    },
  },
  plugins: [
    // TODO once we reach react-relay 8.0, uncomment for simpler build env
    // (Also, delete the relay-compiler stuff form gulpfile.)
    // new RelayCompilerWebpackPlugin({
    //   schema: path.resolve(__dirname, '../relay.json'),
    //   src: path.resolve(__dirname, '../src/app'),
    // }),
    new StylelintPlugin({
      cache: true,
      configFile: path.resolve(__dirname, '../.stylelintrc'),
      context: path.join(__dirname, '../src/app'),
      files: ['**/*.css'],
      lintDirtyModulesOnly: true,
      emitWarning: true,
      failOnError: true,
      failOnWarning: true,
    }),
    new MiniCssExtractPlugin({
      filename: `../css/[name].bundle${BUNDLE_PREFIX}.css`,
      chunkFilename: `../css/[name].chunk${BUNDLE_PREFIX}.css`,
      ignoreOrder: false, // Enable if there are warnings about conflicting order
    }),
    new webpack.ContextReplacementPlugin(
      /react-intl\/locale-data/,
      localesRegExp,
    ),
    new webpack.ContextReplacementPlugin(
      /localization\/translations/,
      localesRegExp,
    ),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      compressionOptions: {
        level:
          NODE_ENV === 'production'
            ? zlib.Z_BEST_COMPRESSION
            : zlib.Z_NO_COMPRESSION,
      },
      test: /\.js$|\.css$|\.html$/,
    }),
    new UnusedFilesWebpackPlugin({
      failOnUnused: true,
      patterns: ['src/app/**/*.js'],
      globOptions: {
        ignore: ['src/app/**/*.test.js', 'src/app/**/_*.js'],
      },
    }),
    new WarningsToErrorsPlugin(),
    sentryWebpackPlugin({
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
      authToken: SENTRY_AUTH_TOKEN,
      telemetry: false, // don't send Sentry errors to Sentry
      disable: NODE_ENV === 'development', // we don't want to upload source maps on every recompile
    }),
  ],
  resolve: {
    alias: { app: path.join(__dirname, '../src/app') },
    extensions: ['.js', '.json', '.css'],
  },
  module: {
    rules: [
      {
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
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, '../src/app')],
        options: {
          failOnError: true,
          failOnWarning: true,
        },
      },
      {
        test: /\.(gif|jpg|png)$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg$/i,
        use: [{
          loader: '@svgr/webpack',
          options: {
            icon: true,
            expandProps: 'start',
            svgProps: {
              className: `{props.className ? props.className + ' check-icon' : 'check-icon'}`,
            },
          }
        }],
      },
      {
          test: /\.css$/,
          use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '/css/',
                },
              },
              {
                  loader: 'css-loader',
                  options: {
                      importLoaders: 1,
                      modules: {
                        auto: true,
                        localIdentName: NODE_ENV === 'production' ? '[hash:base64]' : '[path]___[name]__[local]___[hash:base64:5]',
                      },
                      url: false,
                  }
              },
              {
                  loader: 'postcss-loader',
              },
          ]
      },
    ],
  },
  externals: {
    config: 'config',
    'pusher-js': 'Pusher',
  },
};
