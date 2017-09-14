'use strict';

const Path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

module.exports = (env) => {

  const isBuild = env === 'production' || env === 'prod';

  const port = 3000;

  const entry = Path.resolve(__dirname, './index.js');

  const output = {
    path: Path.resolve(__dirname, './build'),
    filename: '[name].js'
  };

  const template = Path.resolve(__dirname, 'index.html');

  const devtool = !isBuild && 'source-map';

  const devServer = {
    port,
    historyApiFallback: true,
    inline: !isBuild,
    hot: !isBuild,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: true,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      }
    }
  };

  const loaders = [
    { test: /\.js$/, use: 'babel-loader' },
    {
      test: /\.styl$/,
      use: [
        { loader: 'css-loader' },
        { loader: 'stylus-loader' }
      ]
    }
  ];

  const plugins = [new Webpack.NamedModulesPlugin()];

  if (!isBuild)
    plugins.push(new Webpack.HotModuleReplacementPlugin());

  plugins.push(new HTMLWebpackPlugin({
    filename: `index.html`,
    template,
    cache: true,
    inject: 'body',
    minify: isBuild && {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    }
  }));

  return {
    entry,
    output,
    devtool,
    devServer,
    module: {
      loaders
    },
    plugins
  };
};