const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    bundle: ['./src/index.js','./src/another-module.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  watch: true
};