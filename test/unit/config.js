module.exports = {
  appName: 'check', // 'bridge' or 'check'
  selfHost: 'web.test:13333',
  restBaseUrl: 'http://api.test:13000/api/',
  relayPath: 'http://api.test:13000/api/graphql',
  relayHeaders: {
    'X-Check-Token': 'test'
  },
  penderUrl: 'http://pender.test:13200',
};
