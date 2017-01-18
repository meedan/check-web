require 'yaml'
require_relative './app_spec.rb'

config = YAML.load_file('config.yml')
webdriver_url = "http://#{config['sauce_username']}:#{config['sauce_access_key']}@ondemand.saucelabs.com:80/wd/hub"

browser_definitions = {
  safari_ios10_ipad: {
    browserName: 'Safari',
    deviceName: 'iPad Simulator',
    platformName: 'iOS',
    platformVersion: '10.0',
    javascriptEnabled: true,
    appiumVersion: '1.6.3'
  },
  chrome54_macos1012: {
    browserName: 'chrome',
    version: '54.0',
    platform: 'macOS 10.12'
  },
  chrome54_windows10: {
    browserName: 'chrome',
    version: '54.0',
    platform: 'Windows 10'
  },
  chrome48_linux: {
    browserName: 'chrome',
    version: '48.0',
    platform: 'Linux'
  }
}

def browsers_to_test
  # TODO: put ENV vars in npm scripts; read here; return subset of browser_definitions.keys
  [
    :safari_ios10_ipad,
    # :chrome54_macos1012,
    # :chrome54_windows10,
    # :chrome48_linux
  ]
end

describe "browser" do
  browsers_to_test.each do |browser_id|
     describe "#{browser_id}" do
      include_examples "app", webdriver_url, browser_definitions[browser_id]
    end
  end
end
