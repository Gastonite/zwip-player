'use strict';

const Path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

module.exports = (env) => {

  const isProd = env === 'production' || env === 'prod';

  const entry = Path.resolve('./src/index.js');

  const output = {
    path: Path.resolve('./demo'),
    filename: '[name].js'
  };

  const htmlTemplatePath = Path.resolve(__dirname, './src/index.html');

  const devtool = !isProd && 'source-map';

  const devServer = {
    port: 3000,
    historyApiFallback: true,
    inline: !isProd,
    hot: !isProd,
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

  plugins.push(!isProd
    ? new Webpack.HotModuleReplacementPlugin()
    : new Webpack.optimize.UglifyJsPlugin({
      sourceMap: devtool && (options.devtool.indexOf("sourcemap") >= 0 || options.devtool.indexOf("source-map") >= 0)
    })
  );

  plugins.push(new HTMLWebpackPlugin({
    filename: `index.html`,
    template: htmlTemplatePath,
    cache: true,
    inject: 'body',
    minify: isProd && {
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