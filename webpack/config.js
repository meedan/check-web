import path from 'path';
import webpack from 'webpack';

export default {
  bail: true, // exit 1 on build failure
  entryWeb: {
    index: [ 'babel-polyfill', path.join(__dirname, '../src/web/index/index') ]
  },
  output: {
    pathWeb: path.join(__dirname, '../build/web/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      },
      __DEVELOPMENT__: false
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ],
  resolve: {
    alias: {app: path.join(__dirname, '../src/app')},
    extensions: ['', '.js']
  },
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
  },
  externals: {
    'config': 'config'
  }
};
