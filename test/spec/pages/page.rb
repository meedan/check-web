require 'selenium-webdriver'
require_relative '../app_spec_helpers.rb'

class Page
  attr_reader :driver

  include AppSpecHelpers

  def initialize(options)
    @config = options[:config]
    @driver = options[:driver]
    @wait = Selenium::WebDriver::Wait.new(timeout: 30)
  end

  def load
    @driver.navigate.to url
    self
  end

  def element(selector, options = {})
    wait = options[:timeout] ? Selenium::WebDriver::Wait.new(timeout: options[:timeout]) : @wait

    wait.until {
      element = @driver.find_element(:css, selector)
      begin
        element if element.displayed? || options[:hidden]
      rescue
        element = @driver.find_element(:css, selector)
        element if element.displayed? || options[:hidden]
      end
    }
  end

  def elements(selector, options = {})
    wait = options[:timeout] ? Selenium::WebDriver::Wait.new(timeout: options[:timeout]) : @wait

    wait.until {
      @driver.find_elements(:css, selector)
    }
  end

  def click(selector)
    element(selector).click
  end

  def wait_for_element(selector, options = {})
    element(selector, options)
    nil
  end

  def wait_all_elements(size, selector, type = :css)
      count = 0
      begin
        count = count + 1
        el = @driver.find_elements(type, selector)
        sleep 1
      end while (el.length < size and count < 10)
      el
  end

  def wait_for_string(string)
    @wait.until {
      contains_string?(string)
    }
  end

  def fill_input(selector, value, options = {})
    input = element(selector, options)
    input.send_keys(:control, 'a', :delete) if options[:clear]
    input.send_keys(value)
  end

  def press(key)
    @driver.action.send_keys(key).perform
  end

  def click_button(selector = 'button')
    begin
      element(selector).click
    rescue
      wait_for_selector(selector).click
    end
  end

  def contains_string?(string)
    @driver.page_source.include?(string)
  end

  def contains_element?(selector, options = {})
    begin
      element(selector, options)
    rescue
      return false
    end
    true
  end

  def request_api(path, params)
    require 'net/http'
    api_path = @driver.execute_script("return config.restBaseUrl.replace(/\\/api\\/.*/, '#{path}')").to_s
    uri = URI(api_path)
    uri.query = URI.encode_www_form(params)
    Net::HTTP.get_response(uri)
  end

  def close
    @driver.quit
  end
end
