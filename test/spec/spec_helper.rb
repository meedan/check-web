require 'httparty'
require 'rspec/retry'
require 'base64'

RSpec.configure do |config|
  config.verbose_retry = true
  config.display_try_failure_messages = true
  config.default_retry_count = ENV['TEST_RETRY_COUNT'] || 0
  config.default_sleep_interval = 1

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end
end
