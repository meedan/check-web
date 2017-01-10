require 'yaml'

config = YAML.load_file('config.yml')
proxy_cmd = "/app/test/spec/sauce/sc-4.4.2-linux/bin/sc -u #{config['sauce_username']} -k #{config['sauce_access_key']}"
system(proxy_cmd)
