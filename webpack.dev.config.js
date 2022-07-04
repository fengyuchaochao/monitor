const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    monitor: path.resolve(__dirname, './src/index.js')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './example')
    },
    compress: true,
    port: 9000,
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './example/index.html'),
      chunks: ['monitor'],
      scriptLoading: 'blocking',
      inject: 'head'
    })
  ]
};