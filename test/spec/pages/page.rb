require 'selenium-webdriver'

class Page
  attr_reader :driver

  def initialize(options)
    @config = options[:config]
    @driver = options[:driver]
    @wait = Selenium::WebDriver::Wait.new(timeout: 10)
  end

  def load
    @driver.navigate.to url # assumes subclass pages implement `url` method
    self
  end

  def element(selector, options = {})
    wait = options[:timeout] ? Selenium::WebDriver::Wait.new(timeout: options[:timeout]) : @wait

    wait.until {
      element = @driver.find_element(:css, selector)
      element if element.displayed? || options[:hidden]
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

  def wait_for_string(string)
    @wait.until {
      contains_string?(string)
    }
  end

  def fill_input(selector, value, options = {})
    input = element(selector, options)
    input.clear if options[:clear]
    input.send_keys(value)
  end

  def press(key)
    @driver.action.send_keys(key).perform
  end

  def click_button(selector = 'button')
    element(selector).click
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

  def load_api(path, params)
    require 'net/http'
    api_path = @driver.execute_script("return config.restBaseUrl.replace(/\\/api\\/.*/, '#{path}')").to_s
    uri = URI(api_path)
    uri.query = URI.encode_www_form(params)
    @driver.navigate.to uri
  end


  def close
    @driver.quit
  end
end
