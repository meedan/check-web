require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/teams_page.rb'
require_relative './pages/page.rb'
require_relative './pages/project_page.rb'

CONFIG = YAML.load_file('config.yml')
require_relative "#{CONFIG['app_name']}/quicktest_custom_spec.rb"

def new_driver(webdriver_url, browser_capabilities)
  if @config.key?('proxy') and !webdriver_url.include? "browserstack"
    proxy = Selenium::WebDriver::Proxy.new(
      :http     => @config['proxy'],
      :ftp      => @config['proxy'],
      :ssl      => @config['proxy']
    )
    caps = Selenium::WebDriver::Remote::Capabilities.chrome(:proxy => proxy)
    dr = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => @config['chromedriver_url'])
  else
    dr = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
  end
  dr
end

$caller_name = ""
shared_examples 'app' do |webdriver_url, browser_capabilities|

  include AppSpecHelpers

  before :all do
    @wait = Selenium::WebDriver::Wait.new(timeout: 10)
    @email = "sysops#{Time.now.to_i}#{Process.pid}@meedan.com"
    @password = '12345678'
    @source_url = 'https://twitter.com/ironmaiden?timestamp=' + Time.now.to_i.to_s
    @media_url = 'https://twitter.com/meedan/status/773947372527288320/?t=' + Time.now.to_i.to_s
    @config = CONFIG
    $source_id = nil
    $media_id = nil
    @e1 = 'sysops' + Time.now.to_i.to_s + '@meedan.com'
    @t1 = 'team1' + Time.now.to_i.to_s
    @t2 = 'team2' + Time.now.to_i.to_s
    @new_tag = nil

    begin
      FileUtils.cp('./config.js', '../build/web/js/config.js')
    rescue
      puts "Could not copy local ./config.js to ../build/web/js/"
    end

  end

  after :all do
    FileUtils.cp('../config.js', '../build/web/js/config.js')
  end

  before :each do |example|
    $caller_name = example.metadata[:description_args]
    @driver = new_driver(webdriver_url,browser_capabilities)
  end

  after :each do |example|
    if example.exception
      link = save_screenshot("Test failed: #{example.description}")
      puts "Test \"#{example.description}\" failed! Check screenshot at #{link} and following browser output: #{console_logs}"
    end
    @driver.quit
  end

  context "web" do
    it "should login using Slack" do
      p = Page.new(config: @config, driver: @driver)
      p.go ("https://#{@config['slack_domain']}.slack.com")
      fill_field('#email', @config['slack_user'])
      fill_field('#password', @config['slack_password'])
      press_button('#signin_btn')
      page = LoginPage.new(config: @config, driver: @driver).load
      sleep 10
      element = page.driver.find_element(:id, "slack-login")
      element.click
      sleep 2
      window = @driver.window_handles.last
      @driver.switch_to.window(window)
      sleep 10
      press_button('#oauth_authorizify')
      sleep 5
      window = @driver.window_handles.first
      sleep 5
      @driver.switch_to.window(window)
      p.go(@config['self_url'] + '/check/me')
      sleep 10
      expect(get_element('.source__name').text.nil?).to be(false)
    end

    it "should login using Facebook" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.login_with_facebook
      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      displayed_name = me_pg.title
      expected_name = @config['facebook_name']
      expect(displayed_name).to eq(expected_name)
    end

    ## Prioritized Script for Automation ##
    it "should register and login using e-mail" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      email, password = ['sysops' + Time.now.to_i.to_s + '@meedan.com', '22345678']
      login_pg.register_and_login_with_email(email: email, password: password)
      me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
      displayed_name = me_pg.title
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should login using Twitter" do
      login_with_twitter
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/check/me')
      displayed_name = get_element('.source__name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    #Create two new teams.
    it "should create 2 teams" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: @e1, password: @password)
          .create_team(name: @t1, slug:@t1)
      page = CreateTeamPage.new(config: @config, driver: page.driver).load
          .create_team(name: @t2, slug:@t2)
      expect(get_element('h1.team__name').text.nil?).to be(false)
    end

    #As a different user, request to join one team.
    it "should join team" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'newsysops' + Time.now.to_i.to_s + '@meedan.com', password: '22345678')
      page = TeamsPage.new(config: @config, driver: @driver).load
          .ask_join_team(subdomain: @t1)
      sleep 3

      expect(@driver.find_element(:class, "message").nil?).to be(false)
    end

    #As the group creator, go to the members page and approve the joining request.
    it "should as the group creator, go to the members page and approve the joining request" do
      page = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @e1, password: @password)
      page = TeamsPage.new(config: @config, driver: @driver).load
          .approve_join_team(subdomain: @t1)
      elems = @driver.find_elements(:css => ".team-members__list > div")
      expect(elems.size).to be > 1
    end

    #Switch teams
    it "should switch teams" do
      page = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @e1, password: @password)
      page = TeamsPage.new(config: @config, driver: @driver).load
          .select_team(name: @t1)
      page = TeamsPage.new(config: @config, driver: @driver).load
          .select_team(name: @t2)
      sleep 3
      expect(page.team_name).to eq(@t2)
    end

    #Add slack notificatios to a team
    it "should add slack notifications to a team " do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @e1, password: @password)
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + @t2)
      sleep 2
      element = @driver.find_element(:class, "team__edit-button")
      element.click
      sleep 2
      element = @driver.find_element(:id, "team__settings-slack-notifications-enabled")
      sleep 2
      element.click
      element = @driver.find_element(:id, "team__settings-slack-webhook")
      sleep 2
      element.click
      element.send_keys "https://hooks.slack.com/services/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"
      sleep 2
      element = @driver.find_element(:class, "team__save-button")
      element.click
      sleep 2
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    end

    #Create a new project.
    it "should create a project for a team " do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @e1, password: @password, project: true)
      name = "Project #{Time.now}"
      element = @driver.find_element(:id, "create-project-title")
      sleep 2
      element.click
      element.send_keys name
      @driver.action.send_keys("\n").perform
      sleep 2
      expect(get_element('h2.project-header__title').text.nil?).to be(false)
    end

    #Create a new media using a link from:     #Facebook      #YouTube     #Twitter     #  Instagram
    it "should create project media" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @e1, password: @password, project: true)
          .create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      expect(media_pg.contains_string?('Added')).to be(true)
      project_pg = media_pg.go_to_project
      sleep 2
      media_pg = project_pg.create_media(input: 'https://www.facebook.com/FirstDraftNews/posts/1808121032783161?t=' + Time.now.to_i.to_s)
      expect(media_pg.contains_string?('Added')).to be(true)
      project_pg = media_pg.go_to_project
      sleep 2
      media_pg = project_pg.create_media(input: 'https://www.youtube.com/watch?v=ykLgjhBnik0?t=' + Time.now.to_i.to_s)
      expect(media_pg.contains_string?('Added')).to be(true)
      project_pg = media_pg.go_to_project
      sleep 2
      media_pg = project_pg.create_media(input: 'https://www.instagram.com/p/BIHh6b0Ausk?t=' + Time.now.to_i.to_s)
      expect(media_pg.contains_string?('Added')).to be(true)
      $media_id = media_pg.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
      expect($media_id.nil?).to be(false)
    end

    #Add comment to your media.
    it "should add comment to your media" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @e1, password: @password, project: true)
      media_pg.go (team_url('project/' + get_project + '/media/' + $media_id))
      sleep 3
      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)
      # Add a comment as a command
      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 2
      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment')).to be(true)
      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('This is my comment')).to be(true)

      #delete your comment.
      element = @driver.find_element(:css, "svg.menu-button__icon")
      element.click
      sleep 3
      element = @driver.find_element(:class, "annotation__delete")
      element.click
      sleep 3
      expect(@driver.page_source.include?('This is my comment')).to be(false)
    end

    #Add a tag to your media.
    it "should add a tag to your media and delete it" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @e1, password: @password)
          .click_media
      @new_tag = Time.now.to_i.to_s
      page.add_tag(@new_tag)
      sleep 5
      expect(page.has_tag?(@new_tag)).to be(true)
      #Delete this tag.
      page.delete_tag(@new_tag)
      sleep 5
      expect(page.has_tag?(@new_tag)).to be(false)
    end
    include_examples "quicktest_custom"
  end
end
