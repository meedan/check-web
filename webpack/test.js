const nodeExternals = require('webpack-node-externals');
const path = require('path');
const devConfig = require('./config');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, '../src'),
        loader: 'istanbul-instrumenter-loader'
      },
      ...devConfig.module.loaders
    ]
  }
};
