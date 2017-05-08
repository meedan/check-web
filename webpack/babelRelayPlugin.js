const getbabelRelayPlugin = require('babel-relay-plugin');
const schema = require('../relay.json');
module.exports = getbabelRelayPlugin(schema.data);
