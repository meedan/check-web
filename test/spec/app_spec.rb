require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/teams_page.rb'
require_relative './pages/page.rb'

CONFIG = YAML.load_file('config.yml')

require_relative "#{CONFIG['app_name']}/custom_spec.rb"

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
    @config = CONFIG
    $source_id = nil
    $media_id = nil

    FileUtils.cp(@config['config_file_path'], '../build/web/js/config.js') unless @config['config_file_path'].nil?

    @driver = browser_capabilities['appiumVersion'] ?
      Appium::Driver.new({ appium_lib: { server_url: webdriver_url}, caps: browser_capabilities }).start_driver :
      Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)

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
      link = save_screenshot("Test failed: #{example.description}")
      puts "Test \"#{example.description}\" failed! Check screenshot at #{link} and following browser output: #{console_logs}"
    end
    @driver.quit
  end

  # The tests themselves start here

  context "web" do

    include_examples "custom"

    it "should edit the title of a media" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: 'https://twitter.com/softlandscapes/status/834385935240462338?t=' + Time.now.to_i.to_s)
      expect(media_pg.primary_heading.text).to eq('Tweet by soft landscapes')
#      sleep 3 # :/ clicks can misfire if pender iframe moves the button position at the wrong moment
#      media_pg.set_title('Edited media title')

#      expect(media_pg.primary_heading.text).to eq('Edited media title')
      project_pg = media_pg.go_to_project
      sleep 3
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Tweet by soft landscapes')).to be(true)
    end

    it "should not add a duplicated tag from tags list" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_media
      new_tag = Time.now.to_i.to_s

      # Validate assumption that tag does not exist
      expect(page.has_tag?(new_tag)).to be(false)

      # Add tag from tags list
      page.add_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(true)

      # Try to add duplicate
      page.add_tag(new_tag)
      sleep 5

      # Verify that tag is not added and that error message is displayed
      expect(page.tags.count(new_tag)).to be(1)
      expect(page.contains_string?('Tag already exists')).to be(true)
    end

    it "should display a default title for new media" do
      # Tweets
      media_pg = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @email, password: @password)
      @wait.until { @driver.page_source.include?('Claim') }
      media_pg = media_pg.create_media(input: 'https://twitter.com/firstdraftnews/status/835587295394869249?t=' + Time.now.to_i.to_s)
      expect(media_pg.primary_heading.text).to eq('Tweet by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Tweet by First Draft')).to be(true)

      # YouTube
      media_pg = project_pg.create_media(input: 'https://www.youtube.com/watch?v=ykLgjhBnik0?t=' + Time.now.to_i.to_s)
      expect(media_pg.primary_heading.text).to eq('Video by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Video by First Draft')).to be(true)

      # Facebook
      media_pg = project_pg.create_media(input: 'https://www.facebook.com/FirstDraftNews/posts/1808121032783161?t=' + Time.now.to_i.to_s)
      expect(media_pg.primary_heading.text).to eq('Facebook post by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Facebook post by First Draft')).to be(true)
    end

    it "should login using Slack" do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should localize interface based on browser language" do
      unless browser_capabilities['appiumVersion']
        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'fr' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        sleep 1
        expect(driver.find_element(:css, '.login__heading span').text == 'Connexion').to be(true)
        driver.quit

        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'pt' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        sleep 1
        expect(driver.find_element(:css, '.login__heading span').text == 'Entrar').to be(true)
        driver.quit
      end
    end

    it "should access user confirmed page" do
      @driver.navigate.to @config['self_url'] + '/check/user/confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it "should access user unconfirmed page" do
      @driver.navigate.to @config['self_url'] + '/check/user/unconfirmed'
      title = get_element('.main-title')
      expect(title.text == 'Error').to be(true)
    end

    it "should access user already confirmed page" do
      @driver.navigate.to @config['self_url'] + '/check/user/already-confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Already Confirmed').to be(true)
    end

    it "should login using Facebook" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.login_with_facebook

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      displayed_name = me_pg.title
      expected_name = @config['facebook_name']
      expect(displayed_name).to eq(expected_name)
    end

    it "should register and login using e-mail" do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      email, password = ['sysops+' + Time.now.to_i.to_s + '@meedan.com', '22345678']
      login_pg.register_and_login_with_email(email: email, password: password)

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
      displayed_name = me_pg.title
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should create a project for a team" do
      project_name = "Project #{Time.now}"
      project_pg = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: Time.now.to_i.to_s)
          .create_team
          .create_project(name: project_name)

      expect(project_pg.driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
      team_pg = project_pg.click_team_avatar
      expect(team_pg.project_titles.include?(project_name)).to be(true)
    end

    it "should create project media" do
      page = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @email, password: @password)

      page.driver.navigate.to @config['self_url']
      expect(page.contains_string?('Tweet by Marcelo Souza')).to be(false)

      page.create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)

      page.driver.navigate.to @config['self_url']
      page.wait_for_element('.project .media-detail')

      expect(page.contains_string?('Tweet by Marcelo Souza')).to be(true)
    end

    it "should search for image" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

      sleep 8 # wait for Sidekiq

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      sleep 3
      imgsrc = @driver.find_element(:css, '.image-media-card img').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)
    end

    it "should upload image when registering" do
      email, password, avatar = [@email + '.br', '12345678', File.join(File.dirname(__FILE__), 'test.png')]
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: email, password: password, file: avatar)

      me_page = MePage.new(config: @config, driver: page.driver).load
      avatar = me_page.avatar
      expect(avatar.attribute('src').match(/test\.png$/).nil?).to be(false)
    end

    it "should redirect to 404 page" do
      @driver.navigate.to @config['self_url'] + '/something-that/does-not-exist'
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should redirect to login screen if not logged in" do
      @driver.navigate.to @config['self_url'] + '/check/teams'
      title = get_element('.login__heading')
      expect(title.text == 'Sign in').to be(true)
    end

    it "should login using Twitter" do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should show teams at /check/teams" do
      page = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @email, password: @password)
      page.driver.navigate.to @config['self_url'] + '/check/teams'
      page.wait_for_element('.teams')
      expect(page.driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    # it "should go to user page" do
    #   page = LoginPage.new(config: @config, driver: @driver).load
    #       .login_with_email(email: @email, password: @password)
    #
    #   page.element('.fa-ellipsis-h').click
    #   page.element('#link-me').click
    #   page.wait_for_element('.source')
    #   me_page = MePage.new(config: @config, driver: page.driver)
    #
    #   expect((me_page.driver.current_url.to_s =~ /\/me$/).nil?).to be(false)
    #   title = me_page.title
    #   expect(title).to eq('User With Email')
    # end

    it "should go to source page through source/:id" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 5
      source_id = $source_id = @driver.find_element(:css, '.source').attribute('data-id')
      @driver.navigate.to @config['self_url'] + '/check/source/' + source_id.to_s
      sleep 1
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go to source page through user/:id" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 5
      user_id = @driver.find_element(:css, '.source').attribute('data-user-id')
      @driver.navigate.to @config['self_url'] + '/check/user/' + user_id.to_s
      sleep 1
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go back and forward in the history" do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.to @config['self_url'] + '/check/tos'
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
    end

    it "should tag source from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.find_elements(:css, '.ReactTags__tag').empty?).to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(false)

      # Add a tag from tags list
      fill_field('.ReactTags__tagInput input', 'selenium')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag')
      expect(tag.text.gsub(/<[^>]+>|×/, '') == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag')
      expect(tag.text.gsub(/<[^>]+>|×/, '') == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(true)
    end

    it "should tag source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged #command')).to be(false)

      # Add a tag as a command
      fill_field('#cmd-input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag')
      expect(tag.text.gsub(/<[^>]+>|×/, '') == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag')
      expect(tag.text.gsub(/<[^>]+>|×/, '') == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
    end

    it "should redirect to access denied page" do
      user_1 = {email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: '12345678'}
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.register_and_login_with_email(email: user_1[:email], password: user_1[:password])

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      user_1_source_id = me_pg.source_id
      me_pg.logout

      user_2 = {email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: '22345678'}
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.register_and_login_with_email(email: user_2[:email], password: user_2[:password])
      unauthorized_pg = SourcePage.new(id: user_1_source_id, config: @config, driver: login_pg.driver).load
      @wait.until { unauthorized_pg.contains_string?('Access Denied') }

      expect(unauthorized_pg.contains_string?('Access Denied')).to be(true)
      expect((unauthorized_pg.driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
    end

    it "should comment source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 1

      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)

      # Add a comment as a command
      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment')).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 1
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should create source and redirect to newly created source" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/sources/new'
      sleep 1
      fill_field('#create-account-url', @source_url)
      sleep 1
      press_button('#create-account-submit')
      sleep 15
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(false)
      title = get_element('.source-name').text
      expect(title == 'Iron Maiden').to be(true)
    end

    it "should not create duplicated source" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/sources/new'
      sleep 1
      fill_field('#create-account-url', @source_url)
      sleep 1
      press_button('#create-account-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(false)
      title = get_element('.source-name').text
      expect(title == 'Iron Maiden').to be(true)
    end

    it "should not create report as source" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/sources/new'
      sleep 1
      fill_field('#create-account-url', 'https://twitter.com/IronMaiden/status/832726327459446784')
      sleep 1
      press_button('#create-account-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
      message = get_element('.create-account .message').text
      expect(message.match(/Sorry, this is not a profile/).nil?).to be(false)
    end

    it "should tag source multiple times with commas with command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 1

      # Add tags as a command
      fill_field('#cmd-input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tags were added to tags list and annotations list
      tag = @driver.find_elements(:css, '.ReactTags__tag').select{ |s| s.text.gsub(/<[^>]+>|×/, '') == 'foo' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #foo')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag').select{ |s| s.text.gsub(/<[^>]+>|×/, '') == 'bar' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bar')).to be(true)
    end

    it "should tag source multiple times with commas from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 1

      # Add tags from tags list
      fill_field('.ReactTags__tagInput input', 'bla,bli')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tags were added to tags list and annotations list
      tag = @driver.find_elements(:css, '.ReactTags__tag').select{ |s| s.text.gsub(/<[^>]+>|×/, '') == 'bla' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bla')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag').select{ |s| s.text.gsub(/<[^>]+>|×/, '') == 'bli' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bli')).to be(true)
    end

    it "should not add a duplicated tag from command line" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_media
      new_tag = Time.now.to_i.to_s

      # Validate assumption that tag does not exist
      expect(media_pg.has_tag?(new_tag)).to be(false)

      # Try to add from command line
      media_pg.add_annotation("/tag #{new_tag}")
      Selenium::WebDriver::Wait.new(timeout: 10).until { media_pg.has_tag?(new_tag) } # TODO: wait inside MediaPage
      expect(media_pg.has_tag?(new_tag)).to be(true)

      # Try to add duplicate from command line
      media_pg.add_annotation("/tag #{new_tag}")

      # Verify that tag is not added and that error message is displayed
      expect(media_pg.tags.count(new_tag)).to be(1)
      expect(media_pg.contains_string?('Tag already exists')).to be(true)
    end

    it "should not create duplicated media if registered" do
      login_with_email

      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10
      id1 = @driver.current_url.to_s.gsub(/^.*\/media\//, '').to_i
      expect(id1 > 0).to be(true)

      @driver.navigate.to @driver.current_url.to_s.gsub(/\/media\/[0-9]+$/, '')

      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10

      id2 = @driver.current_url.to_s.gsub(/^.*\/media\//, '').to_i
      expect(id2 > 0).to be(true)

      expect(id1 == id2).to be(true)
    end

    it "should tag media from tags list" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_media

      new_tag = Time.now.to_i.to_s
      expect(page.contains_string?("Tagged \##{new_tag}")).to be(false)
      page.add_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(true)
      sleep 2
      expect(page.contains_string?("Tagged \##{new_tag}")).to be(true)

      page.driver.navigate.refresh
      page.wait_for_element('.media')
      expect(page.has_tag?(new_tag)).to be(true)
      expect(page.contains_string?("Tagged \##{new_tag}")).to be(true)
    end

    it "should tag media as a command" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_media
      expect(page.has_tag?('command')).to be(false)
      expect(page.contains_string?('Tagged #command')).to be(false)

      # Add a tag as a command
      page.add_annotation('/tag command')

      # Verify that tag was added to tags list and annotations list
      expect(page.has_tag?('command')).to be(true)
      expect(page.contains_string?('Tagged #command')).to be(true)

      # Reload the page and verify that tags are still there
      page.driver.navigate.refresh
      page.wait_for_element('.media')
      expect(page.has_tag?('command')).to be(true)
      expect(page.contains_string?('Tagged #command')).to be(true)
    end

    it "should comment media as a command" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)

      # Add a comment as a command
      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment')).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should flag media as a command" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: "Media #{Time.now.to_i}")

      expect(media_pg.contains_string?('Flag')).to be(false)

      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit
      sleep 2

      expect(media_pg.contains_string?('Flag')).to be(true)
      media_pg.driver.navigate.refresh
      media_pg.wait_for_element('.media')
      expect(media_pg.contains_string?('Flag')).to be(true)
    end

    it "should edit project" do
      project_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_team_avatar
          .create_project

      new_title = "Changed title #{Time.now.to_i}"
      new_description = "Set description #{Time.now.to_i}"
      expect(project_pg.contains_string?(new_title)).to be(false)
      expect(project_pg.contains_string?(new_description)).to be(false)

      project_pg.edit(title: new_title, description: new_description)

      project_pg.wait_for_element('.project-header__title')
      sleep 3
      expect(project_pg.contains_string?(new_title)).to be(true)
      project_pg.wait_for_element('.project__description')
      expect(project_pg.contains_string?(new_description)).to be(true)
    end

    # it "should comment project as a command" do
    #   login_with_email

    #   @driver.navigate.to @config['self_url']
    #   sleep 1
    #   title = "Project #{Time.now}"
    #   fill_field('#create-project-title', title)
    #   @driver.action.send_keys(:enter).perform
    #   sleep 5

    #   # First, verify that there isn't any comment
    #   expect(@driver.page_source.include?('This is my comment')).to be(false)

    #   # Add a comment as a command
    #   fill_field('#cmd-input', '/comment This is my comment')
    #   @driver.action.send_keys(:enter).perform
    #   sleep 5

    #   # Verify that comment was added to annotations list
    #   expect(@driver.page_source.include?('This is my comment')).to be(true)

    #   # Reload the page and verify that comment is still there
    #   @driver.navigate.refresh
    #   sleep 3
    #   expect(@driver.page_source.include?('This is my comment')).to be(true)
    # end

    it "should redirect to 404 page if id does not exist" do
      login_with_email
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(/project\/([0-9]+).*/, 'project/999')
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
      expect((@driver.current_url.to_s =~ /\/404$/).nil?).to be(false)
    end

    it "should logout" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .logout

      expect(page.contains_string?('Sign in')).to be(true)
    end

    # it "should ask to join team" do
    #   skip("Needs to be implemented")
    # end

    # it "should redirect to team page if user asking to join a team is already a member" do
    #   skip("Needs to be implemented")
    # end

    # it "should reject member to join team" do
    #   skip("Needs to be implemented")
    # end

    # it "should accept member to join team" do
    #   skip("Needs to be implemented")
    # end

    # it "should change member role" do
    #   skip("Needs to be implemented")
    # end

    # it "should delete member from team" do
    #   skip("Needs to be implemented")
    # end

    # it "should delete annotation from annotations list (for media, source and project)" do
    #   skip("Needs to be implemented")
    # end

    # it "should delete tag from tags list (for media and source)" do
    #   skip("Needs to be implemented")
    # end

    # it "should edit team" do
    #   skip("Needs to be implemented")
    # end

    # it "should show 'manage team' link only to team owners" do
    #   skip("Needs to be implemented")
    # end

    # it "should show 'edit project' link only to users with 'update project' permission" do
    #   skip("Needs to be implemented")
    # end

    it "should navigate between teams" do
      # setup
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: @password)
          .create_team(name: 'Team 1')
      expect(page.team_name).to eq('Team 1')
      page = page.create_project(name: 'Team 1 Project')
      expect(page.project_title).to eq('Team 1 Project')

      page = CreateTeamPage.new(config: @config, driver: page.driver).load
          .create_team(name: 'Team 2')
      expect(page.team_name).to eq('Team 2')
      page = page.create_project(name: 'Team 2 Project')
      expect(page.project_title).to eq('Team 2 Project')

      # test
      page = TeamsPage.new(config: @config, driver: page.driver).load
          .select_team(name: 'Team 1')

      expect(page.team_name).to eq('Team 1')
      expect(page.project_titles.include?('Team 1 Project')).to be(true)
      expect(page.project_titles.include?('Team 2 Project')).to be(false)

      page = TeamsPage.new(config: @config, driver: page.driver).load
          .select_team(name: 'Team 2')

      expect(page.team_name).to eq('Team 2')
      expect(page.project_titles.include?('Team 2 Project')).to be(true)
      expect(page.project_titles.include?('Team 1 Project')).to be(false)
    end

    it "should update notes count after delete annotation" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
        .login_with_email(email: @email, password: @password)
        .create_media(input: 'https://twitter.com/joeyayoub/status/829060304642383873?t=' + Time.now.to_i.to_s)
      media_pg.fill_input('#cmd-input', 'Test')
      media_pg.element('#cmd-input').submit
      sleep 1
      notes_count = get_element('.media-detail__check-notes-count')
      expect(notes_count.text == '1 note').to be(true)
      media_pg.delete_annotation
      sleep 1
      expect(notes_count.text == 'No notes').to be(true)
    end

    it "should auto refresh project when media is created" do
      project_name = "Project #{Time.now}"
      project_pg = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: Time.now.to_i.to_s)
          .create_team
          .create_project(name: project_name)

      url = project_pg.driver.current_url
      sleep 3
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)

      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      fill_field('#create-media-input', 'Auto-Refresh')
      press_button('#create-media-submit')
      sleep 5
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)

      sleep 5
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    it "should auto refresh media when annotation is created" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
        .login_with_email(email: @email, password: @password)
        .create_media(input: "Media #{Time.now.to_i}")

      url = media_pg.driver.current_url
      sleep 3
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)

      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      media_pg.fill_input('#cmd-input', 'Auto-Refresh')
      media_pg.element('#cmd-input').submit
      sleep 5
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)

      sleep 5
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    # it "should cancel request through switch teams" do
    #   skip("Needs to be implemented")
    # end

    # it "should give 404 when trying to acess a media that is not related to the project on the URL" do
    #   skip("Needs to be implemented")
    # end

    # it "should linkify URLs on comments" do
    #   skip("Needs to be implemented")
    # end

    # it "should add and remove suggested tags" do
    #   skip("Needs to be implemented")
    # end

    # it "should find all medias with an empty search" do
    #   skip("Needs to be implemented")
    # end

    # it "should find medias when searching by keyword" do
    #   skip("Needs to be implemented")
    # end

    # it "should find medias when searching by status" do
    #   skip("Needs to be implemented")
    # end

    # it "should find medias when searching by tag" do
    #   skip("Needs to be implemented")
    # end

    it "should add image to media comment" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
                 .login_with_email(email: @email, password: @password)
                 .create_media(input: 'Images in comments')
      sleep 3

      # First, verify that there isn't any comment with image
      expect(@driver.page_source.include?('This is my comment with image')).to be(false)

      # Add a comment as a command
      fill_field('#cmd-input', 'This is my comment with image')
      @driver.find_element(:css, '.add-annotation__insert-photo').click
      sleep 1
      input = @driver.find_element(:css, 'input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      sleep 3
      @driver.find_element(:css, '.add-annotation__buttons button').click
      sleep 5

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment with image')).to be(true)
      imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)

      # Zoom image
      expect(@driver.find_elements(:css, '.image-current').empty?).to be(true)
      @driver.find_element(:css, '.annotation__card-thumbnail').click
      expect(@driver.find_elements(:css, '.image-current').empty?).to be(false)
      @driver.action.send_keys(:escape).perform
      expect(@driver.find_elements(:css, '.image-current').empty?).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('This is my comment with image')).to be(true)
      imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)
    end

    # it "should move media to another project" do
    #   skip("Needs to be implemented")
    # end

    it "should add, edit, answer, update answer and delete task" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
                 .login_with_email(email: @email, password: @password)
                 .create_media(input: 'Tasks')
      sleep 3

      # Create a task
      expect(@driver.page_source.include?('Foo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task "Foo or bar?" created by')).to be(false)
      @driver.find_element(:css, '.create-task__add-button').click
      @driver.find_element(:css, '.create-task__add-short-answer').click
      sleep 1
      fill_field('#task-label-input', 'Foo or bar?')
      @driver.find_element(:css, '.create-task__dialog-submit-button').click
      sleep 2
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task "Foo or bar?" created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('Task "Foo or bar?" answered by')).to be(false)
      @driver.find_element(:css, '.task__label').click
      fill_field('textarea[name="response"]', 'Foo')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.include?('Task "Foo or bar?" answered by')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Task "Foo or bar?" edited to "This or that?" by')).to be(false)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').first.click
      fill_field('textarea[name="label"]', '??')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "Foo or bar?" edited to "Foo or bar???" by')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Foo or bar???" answered by User With Email: "Foo edited"')).to be(false)
      @driver.find_element(:css, '#task__edit-response-button').click
      fill_field('textarea[name="editedresponse"]', ' edited')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Foo or bar???" answered by User With Email: "Foo edited"')).to be(true)

      # Delete task
      expect(@driver.page_source.include?('Foo')).to be(true)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').last.click
      @driver.switch_to.alert.accept
      sleep 3
      expect(@driver.page_source.include?('Foo')).to be(false)
    end

    # it "should add, edit, answer, update answer and delete single_choice task" do
    #   skip("Needs to be implemented")
    # end

    # it "should add, edit, answer, update answer and delete multiple_choice task" do
    #   skip("Needs to be implemented")
    # end

    it "should search for reverse images" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: 'https://www.instagram.com/p/BRYob0dA1SC/')
      sleep 2
      expect(@driver.page_source.include?('This item contains at least one image. Click Search to look for potential duplicates on Google.')).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      @driver.find_element(:css, '.annotation__reverse-image-search').click
      sleep 3
      @driver.switch_to.window(@driver.window_handles.last)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    it "should refresh media" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: 'http://ca.ios.ba/files/meedan/random.php')
      sleep 2
      title1 = @driver.title
      expect((title1 =~ /Random/).nil?).to be(false)
      @driver.find_element(:css, '.media-actions__icon').click
      @driver.find_element(:css, '#media-actions__refresh').click
      sleep 5
      title2 = @driver.title
      expect((title2 =~ /Random/).nil?).to be(false)
      expect(title1 != title2).to be(true)
    end

    it "should search by project" do
      create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(true)
      @driver.find_element(:xpath, "//li[contains(text(), 'Project')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(false)
      expect((@driver.title =~ /Project/).nil?).to be(false)
      @driver.find_element(:xpath, "//li[contains(text(), 'Project')]").click
      sleep 10
      expect((@driver.title =~ /Project/).nil?).to be(true)
    end

    it "should search and change sort criteria" do
      create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Recent activity')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Created')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search and change sort order" do
      create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Newest')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Oldest')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search by project through URL" do
      create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"projects"%3A%5B0%5D%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(false)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected')
      expect(selected.size == 2).to be(true)
    end

    it "should change search sort criteria through URL" do
      create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort"%3A"recent_activity"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Recent activity', 'Newest first'].sort).to be(true)
    end

    it "should change search sort order through URL" do
      create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort_type"%3A"ASC"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Created', 'Oldest first'].sort).to be(true)
    end

    it "should login from e-mail login page" do
      page = Page.new(config: @config, driver: @driver)
      @driver.navigate.to @config['self_url']
      page.fill_input('.login__email input', @email)
      page.fill_input('.login__password input', @password)
      expect(@driver.page_source.include?('Project')).to be(false)
      (@wait.until { @driver.find_element(:xpath, "//button[@id='submit-register-or-login']") }).click
      sleep 5
      expect(@driver.page_source.include?('Project')).to be(true)
    end

    it "should not reset password" do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(true)
      expect(@driver.page_source.include?('Password reset sent')).to be(false)
    end

    it "should reset password" do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password(@email)
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(false)
      expect(@driver.page_source.include?('Password reset sent')).to be(true)
    end
  end
end
