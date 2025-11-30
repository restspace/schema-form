const path = require('path');

module.exports = function override(config) {
  // Ensure both the app and @restspace/schema-form resolve React/ReactDOM
  // to the example app's single copy under ./node_modules.
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    react: path.resolve(__dirname, 'node_modules/react'),
    'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  };

  return config;
};
