require 'yaml'
require_relative './quicktest_spec.rb'

config = YAML.load_file('config.yml')

describe "integration (chrome)" do
  include_examples "app", config['chromedriver_url'], :chrome, false
end
