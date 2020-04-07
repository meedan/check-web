const nodeExternals = require('webpack-node-externals');
const path = require('path');
const devConfig = require('./config');

module.exports = {
  target: 'node',
  mode: 'development',
  externals: [nodeExternals()],
  module: {
    rules: [
      ...devConfig.module.rules,
      {
        test: /\.js/,
        enforce: 'post',
        include: path.resolve(__dirname, '../src'),
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true },
      },
    ]
  },
  resolve: {
    alias: {
      config$: path.resolve(__dirname, '../test/unit/config.js'),
    },
  }
};
