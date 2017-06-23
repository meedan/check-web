require 'yaml'
require_relative './quicktest_spec.rb'

config = YAML.load_file('config.yml')
browsers = YAML.load_file('browsers.yml')

browser_definitions = {}
browsers.each do |browser|
  browser_definitions[browser[0]] = browser[1]
end

describe "browser" do
  browser_definitions.each do |browser_id|
    p browser_id
    describe "#{browser_id}" do
      browser_id[1]["browserstack.debug"] = true
      include_examples "app", config['webdriver_url'], browser_id[1]
    end
  end
end
