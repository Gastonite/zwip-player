'use strict';

const Path = require('path');
const WebpackConfig = require('../../make-config');

module.exports = (env) => {

  const isBuild = env === 'production' || env === 'prod';

  const entry = Path.resolve(__dirname, './index.js');

  const output = {
    path: Path.resolve(__dirname, './build'),
    filename: '[name].js'
  };

  const template = Path.resolve(__dirname, 'index.html');

  return WebpackConfig({
    isBuild,
    entry,
    output,
    template
  });

};