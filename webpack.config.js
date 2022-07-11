const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    bundle: ['./src/app.js'],
    app: ['./src/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
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