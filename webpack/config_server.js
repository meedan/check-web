const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// set all node_modules as externals
const externals = {};
fs.readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    externals[mod] = `commonjs ${mod}`;
  });
// and config too
externals.config = 'config';
externals['config-server'] = 'config-server';
externals['../config-server'] = '../config-server';

module.exports = {
  entry: path.join(__dirname, '../scripts/server.js'),
  target: 'node',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'server.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: { presets: ['es2015', 'stage-0', 'react'], plugins: [path.join(__dirname, './babelRelayPlugin.js')] },
    }, {
      test: /\.css?$/,
      loaders: ['style-loader', 'raw-loader'],
    }],
  },

  externals,
};
