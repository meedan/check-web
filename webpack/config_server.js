var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

// set all node_modules as externals
var externals = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    externals[mod] = 'commonjs ' + mod;
  });
// and config too
externals['config'] = 'config';

module.exports = {
  entry: path.join(__dirname, '../scripts/server.js'),
  target: 'node',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: ['babel'],
      exclude: /node_modules/,
      query: { presets: ['es2015', 'stage-0', 'react'], plugins: [path.join(__dirname, './babelRelayPlugin.js')]}
    }, {
      test: /\.css?$/,
      loaders: ['style', 'raw']
    }]
  },

  externals: externals
}