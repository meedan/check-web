require 'yaml'
require_relative './app_spec.rb'

config = YAML.load_file('config.yml')

AppSpec.call(config['chromedriver_url'], :chrome)
