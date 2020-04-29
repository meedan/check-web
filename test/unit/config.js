module.exports = {
  appName: 'check', // 'bridge' or 'check'
  selfHost: 'web:3333',
  restBaseUrl: 'http://api:3000/api/',
  relayPath: 'http://api:3000/api/graphql',
  relayHeaders: {
    'X-Check-Token': 'test'
  },
  penderUrl: 'http://pender:3200',
};
