import nodeExternals from 'webpack-node-externals';
import path from 'path';

export default {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: ['babel'],
      exclude: /node_modules/,
      query: { presets: ['es2015', 'stage-0', 'react'], plugins: [path.join(__dirname, '../src/plugins/babelRelayPlugin.js')]}
    }, {
      test: /\.css?$/,
      loaders: ['style', 'raw']
    }]
  }
};
