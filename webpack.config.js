const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  mode: 'production', // development | production
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    filename: 'rdflib.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'rdflib'
  },
  plugins: [
    new NodePolyfillPlugin()
  ]
};
