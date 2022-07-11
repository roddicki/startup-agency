const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    admin: ['./src/admin.js'],
    app: ['./src/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
    filename: '[name].bundle.js'
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