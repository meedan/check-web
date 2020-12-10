require 'yaml'
require_relative './app_spec'

config = YAML.load_file('config.yml')
chromedriver_url = ENV['CHROMEDRIVER_URL'] || config['chromedriver_url']

describe 'integration (chrome)' do
  include_examples 'app', chromedriver_url
end
