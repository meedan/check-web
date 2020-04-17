require('ignore-styles').default(['.css']);

const path = require('path');
const jsdom = require('jsdom').jsdom;
const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
  platform: 'linux',
};

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
enzyme.configure({ adapter: new Adapter() });

// Override "require('config')" to return the test-config name.
// Webpack won't do this, because when target=node it just outputs
// as normal.
//
// TODO use a different test runner -- e.g., jest.mock() would be
// cleaner.
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = (name, ...args) => {
  if (name === 'config') {
    return path.resolve(__dirname, 'config.js');
  } else {
    return originalResolve.call(this, name, ...args);
  }
}
