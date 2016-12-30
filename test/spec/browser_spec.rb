require 'yaml'
require_relative './app_spec.rb'

config = YAML.load_file('config.yml')
webdriver_url = "http://#{config['sauce_username']}:#{config['sauce_access_key']}@ondemand.saucelabs.com:80/wd/hub"

browsers = [
  :chrome,
  {
    appiumVersion: '1.6.3',
    deviceName: 'iPad Simulator',
    platformName: 'iOS',
    platformVersion: '10.0',
    browserName: 'Safari',
    javascriptEnabled: true
  }
]

browsers.each { |browser| AppSpec.call(webdriver_url, browser) }
