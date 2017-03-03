require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require File.join(File.expand_path(File.dirname(__FILE__)), 'spec_helper')
require File.join(File.expand_path(File.dirname(__FILE__)), 'app_spec_helpers')
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/teams_page.rb'

shared_examples 'app' do |webdriver_url, browser_capabilities|

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
		@e1 = 'sysops+' + Time.now.to_i.to_s + '@meedan.com'

    FileUtils.cp(@config['config_file_path'], '../build/web/js/config.js') unless @config['config_file_path'].nil?

    @driver =  Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)

    # TODO: better initialization w/ parallelization
    page = LoginPage.new(config: @config, driver: @driver).load
    begin
      page = page.register_and_login_with_email(email: @email, password: @password)
    rescue
      page = page.login_with_email(email: @email, password: @password)
    end
  end

  # Close the testing webserver after all tests run

  after :all do
    FileUtils.cp('../config.js', '../build/web/js/config.js')
  end

  # Start Google Chrome before each test

  before :each do
    @driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
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
		#Sign in/Sign up:
		#Login by any of these.
		#Sign up using an email.
=begin
    it "should register and login using e-mail" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      email, password = ['sysops+' + Time.now.to_i.to_s + '@meedan.com', '22345678']
      login_pg.register_and_login_with_email(email: email, password: password)

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
      displayed_name = me_pg.title
      expect(displayed_name == 'User With Email').to be(true)
    end

		#Sign up using Twitter or Facebook account.
    it "should login using Facebook" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.login_with_facebook

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      displayed_name = me_pg.title
      expected_name = @config['facebook_name']
      expect(displayed_name).to eq(expected_name)
    end


    it "should login using Slack" do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

		#Sign up using Slack
    it "should login using Twitter" do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end
=end
    #Create two new teams. 
    it "should create 2 teams" do
      # setup
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: @e1, password: @password)
          .create_team(name: 'team1')
      expect(page.team_name).to eq('team1')

      page = CreateTeamPage.new(config: @config, driver: page.driver).load
          .create_team(name: 'team2')
      expect(page.team_name).to eq('team2')
    end

		#As a different user, request to join one team.
    it "should join team" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: '22345678')

      page = TeamsPage.new(config: @config, driver: @driver).load
          .ask_join_team(subdomain: 'team1team1')    
		end
  end
end
