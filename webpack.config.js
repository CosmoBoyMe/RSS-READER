const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/app.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    compress: true,
    port: 8080,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
