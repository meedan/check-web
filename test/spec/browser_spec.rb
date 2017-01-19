require 'yaml'
require_relative './app_spec.rb'

config = YAML.load_file('config.yml')
webdriver_url = "http://clarissaxavier1:TfqXkp3vcowrJWdDuJAK@hub-cloud.browserstack.com/wd/hub" #"http://#{config['sauce_username']}:#{config['sauce_access_key']}@ondemand.saucelabs.com:80/wd/hub"

browser_definitionsOLD = {
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

browser_definitions = {
  safari_osx_sierra: {
		browser: 'Safari',
		browser_version: '10.0',
		os: 'OS X',
		os_version: 'Sierra',
		resolution: '1024x768',
		'browserstack.localIdentifier': 'Test123',
	  'browserstack.debug': 'true',
		'browserstack.local': 'true' 
  },
  chrome54_osx_sierra: {
		browser: 'Chrome',
		browser_version: '54.0',
		os: 'OS X',
		os_version: 'Sierra',
		resolution: '1024x768',
		'browserstack.localIdentifier': 'Test123',
	  'browserstack.debug': 'true',
		'browserstack.local': 'true' 
  },
  firefox_windows10: {
		browser: 'Firefox',
		browser_version: '50.0',
		os: 'Windows',
		os_version: '10',
		resolution: '1280x1024',
		'browserstack.localIdentifier': 'Test123',
	  'browserstack.debug': 'true',
		'browserstack.local': 'true' 
  },
  chrome54_windows10: {
		browser: 'Chrome',
		browser_version: '54.0',
		os: 'Windows',
		os_version: '10',
		resolution: '1280x1024',
		'browserstack.localIdentifier': 'Test123',
	  'browserstack.debug': 'true',
		'browserstack.local': 'true' 
  },
	ios_iphone5:{
		browserName: 'iPhone',
		platform: 'MAC',
		device: 'iPhone 5',
		'browserstack.localIdentifier': 'Test123',
	  'browserstack.debug': 'true',
		'browserstack.local': 'true' 
	}
}

def browsers_to_test
  # TODO: put ENV vars in npm scripts; read here; return subset of browser_definitions.keys
  [
		:safari_osx_sierra,
		:chrome54_osx_sierra,
		:firefox_windows10,
		:chrome54_windows10,
		:ios_iphone5
  ]
end

describe "browser" do
  browsers_to_test.each do |browser_id|
     describe "#{browser_id}" do
      include_examples "app", webdriver_url, browser_definitions[browser_id]
    end
  end
end
