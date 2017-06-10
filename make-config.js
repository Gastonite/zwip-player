'use strict';

const HTMLWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

module.exports = (options) => {

  const { isBuild, entry, output, template = false, port = 3000 } = options;

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
    {test: /\.js$/, use: 'babel-loader' }
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
      minifyURLs: true,
    },
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