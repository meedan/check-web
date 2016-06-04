var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('./../../data/relay.json');
module.exports = getbabelRelayPlugin(schema.data);
