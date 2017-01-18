require 'rubygems'
require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require File.join(File.expand_path(File.dirname(__FILE__)), 'spec_helper')
require File.join(File.expand_path(File.dirname(__FILE__)), 'app_spec_helpers')
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/teams_page.rb'


  # Helpers

  include AppSpecHelpers

  # Start a webserver for the web app before the tests

  before :all do
    @wait = Selenium::WebDriver::Wait.new(timeout: 10)

    @email = "sysops+#{Time.now.to_i}#{Process.pid}@meedan.com"
    @password = '12345678'
    @source_url = 'https://twitter.com/ironmaiden?timestamp=' + Time.now.to_i.to_s
    @media_url = 'https://twitter.com/meedan/status/773947372527288320/?t=' + Time.now.to_i.to_s
    @config = YAML.load_file('config.yml')
    $source_id = nil
    $media_id = nil

    FileUtils.cp(@config['config_file_path'], '../build/web/js/config.js') unless @config['config_file_path'].nil?


# Input capabilities

driver = Selenium::WebDriver.for(:remote,
  :url => "http://clarissaxavier1:TfqXkp3vcowrJWdDuJAK@hub-cloud.browserstack.com/wd/hub",
  :desired_capabilities => caps)
driver.navigate.to "http://www.google.com"
element = driver.find_element(:name, 'q')
element.send_keys "BrowserStack"
element.submit
puts driver.title
driver.quit

shared_examples 'app' do |webdriver_url, browser_capabilities|


    if @config.key?('proxy')
      proxy = Selenium::WebDriver::Proxy.new(
        :http     => @config['proxy'],
        :ftp      => @config['proxy'],
        :ssl      => @config['proxy']
      )
      caps = Selenium::WebDriver::Remote::Capabilities.chrome(:proxy => proxy)
      caps["browserstack.debug"] = "true"
      caps["name"] = "Testing Selenium 2 with Ruby on BrowserStack"
      caps['browserstack.local'] = 'true'
      @driver = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => @config['chromedriver_url'])
      #@driver = Selenium::WebDriver.for(:remote, :url => "http://clarissaxavier1:TfqXkp3vcowrJWdDuJAK@hub-cloud.browserstack.com/wd/hub", 	  :desired_capabilities => caps)
    else
      caps = Selenium::WebDriver::Remote::Capabilities.new
      caps["browserstack.debug"] = "true"
      caps["name"] = "Testing Selenium 2 with Ruby on BrowserStack"

      @driver = browser_capabilities['appiumVersion'] ?
        Appium::Driver.new({ appium_lib: { server_url: webdriver_url}, caps: browser_capabilities }).start_driver :
        Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
    end


    # TODO: better initialization w/ parallelization
    page = LoginPage.new(config: @config, driver: @driver).load
    begin
      page = page.register_and_login_with_email(email: @email, password: @password)
    rescue
      page = page.login_with_email(email: @email, password: @password)
    end
    page
      .create_team
      .create_project
      .create_media(input: 'Claim')
      .logout_and_close
  end

  # Close the testing webserver after all tests run

  after :all do
    FileUtils.cp('../config.js', '../build/web/js/config.js')
  end

  # Start Google Chrome before each test

  before :each do
    if @config.key?('proxy')
      proxy = Selenium::WebDriver::Proxy.new(
        :http     => @config['proxy'],
        :ftp      => @config['proxy'],
        :ssl      => @config['proxy']
      )
      caps = Selenium::WebDriver::Remote::Capabilities.chrome(:proxy => proxy)
      @driver = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => @config['chromedriver_url'])
    else
      @driver = browser_capabilities['appiumVersion'] ?
        Appium::Driver.new({ appium_lib: { server_url: webdriver_url}, caps: browser_capabilities }).start_driver :
        Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
    end
  end

  # Close Google Chrome after each test

  after :each do |example|
    if example.exception
      require 'rest-client'
      path = '/tmp/' + (0...8).map{ (65 + rand(26)).chr }.join + '.png'
      @driver.save_screenshot(path) # TODO: fix for page model tests
      response = RestClient.post('https://file.io?expires=2', file: File.new(path))
      link = JSON.parse(response.body)['link']
      puts "Test \"#{example.to_s}\" failed! Check screenshot at #{link} and following browser output: #{console_logs}"
    end
    @driver.quit
  end

  # The tests themselves start here

  context "web" do
    it "should access user confirmed page" do
      @driver.navigate.to @config['self_url'] + '/user/confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it "should access user unconfirmed page" do
      @driver.navigate.to @config['self_url'] + '/user/unconfirmed'
      title = get_element('.main-title')
      expect(title.text == 'Error').to be(true)
    end

    
  end
end
