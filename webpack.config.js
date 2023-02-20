const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    admin: ['./src/admin.js'],
    app: ['./src/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
    filename: '[name].bundle.js',
    sourceMapFilename: "[name].js.map"
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  devtool: "source-map",
  watch: true
};