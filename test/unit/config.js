var config = window.config = {
  appName: 'check', // 'bridge' or 'check'
  supportEmail: 'check@meedan.com', // 'hello@speakbridge.io' or 'check@meedan.com'
  selfHost: 'web.test:13333',
  restBaseUrl: 'http://api.test:13000/api/',
  relayPath: 'http://api.test:13000/api/graphql',
  relayHeaders: {
    'X-Check-Token': 'test'
  },
  penderUrl: 'http://pender.test:13200',
}
module.exports = config;
