const getbabelRelayPlugin = require('babel-relay-plugin');
const schema = require('./../../data/relay.json');
module.exports = getbabelRelayPlugin(schema.data);
