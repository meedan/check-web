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
    @driver = browser_capabilities['appiumVersion'] ?
      Appium::Driver.new({ appium_lib: { server_url: webdriver_url}, caps: browser_capabilities }).start_driver :
      Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
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
    it "should localize interface based on browser language" do
      unless browser_capabilities['appiumVersion']
        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'fr' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        sleep 1
        expect(driver.find_element(:css, '.login-menu__heading span').text == 'SE CONNECTER').to be(true)
        driver.quit

        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'pt' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        sleep 1
        expect(driver.find_element(:css, '.login-menu__heading span').text == 'ENTRAR').to be(true)
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
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)

      expect(page.contains_string?('Added')).to be(true)
      expect(page.contains_string?('User With Email')).to be(true)
      expect(page.status_label == 'UNSTARTED').to be(true)

      page.driver.navigate.to @config['self_url']
      page.wait_for_element('.project .medias-and-annotations')

      expect(page.contains_string?('Added')).to be(true)
      expect(page.contains_string?('User With Email')).to be(true)
      expect(page.status_label == 'UNSTARTED').to be(true)

    end

    it "should register and redirect to newly created media" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: @media_url)

      expect(page.contains_string?('Added')).to be(true)
      expect(page.contains_string?('User With Email')).to be(true)
      expect(page.status_label == 'UNSTARTED').to be(true)

      $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
      expect($media_id.nil?).to be(false)
    end

    it "should register and redirect to newly created image media" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

      expect(page.contains_string?('Added')).to be(true)
      expect(page.contains_string?('User With Email')).to be(true)
      expect(page.status_label == 'UNSTARTED').to be(true)

      $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
      expect($media_id.nil?).to be(false)
    end

    it "should search for image" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

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

    it "should click to go to Terms of Service" do
      @driver.navigate.to @config['self_url'] + '/check/tos'
      title = get_element('.main-title')
      expect(title.text == 'Terms of Service').to be(true)
    end

    it "should redirect to login screen if not logged in" do
      @driver.navigate.to @config['self_url'] + '/check/teams'
      title = get_element('.login-menu__heading')
      expect(title.text == 'SIGN IN').to be(true)
    end

    it "should login using Twitter" do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should login using Slack" do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should show team options at /teams" do
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
      fill_field('#create-account-url', 'https://www.youtube.com/watch?v=b708rEG7spI')
      sleep 1
      press_button('#create-account-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
      message = get_element('.create-account .message').text
      expect(message == 'Validation failed: Sorry, this is not a profile').to be(true)
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
      sleep 2

      # Verify that tag is not added and that error message is displayed
      expect(page.tags.count(new_tag)).to be(1)
      expect(page.contains_string?('Validation failed: Tag already exists')).to be(true)
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
      expect(media_pg.contains_string?('Validation failed: Tag already exists')).to be(true)
    end

    it "should not create duplicated media if registered" do
      login_with_email

      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10
      id1 = @driver.current_url.to_s.gsub(/.*\/media\//, '').to_i

      @driver.navigate.to @driver.current_url.to_s.gsub(/\/media\/[0-9]+$/, '')

      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10
      id2 = @driver.current_url.to_s.gsub(/.*\/media\//, '').to_i

      expect(id1 == id2).to be(true)
    end

    it "should not create source as media if registered" do
      login_with_email
      sleep 3
      fill_field('#create-media-input', 'https://www.facebook.com/ironmaidenbeer/?fref=ts')
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/media\/[0-9]+$/).nil?).to be(true)
      message = get_element('.create-media .message').text
      expect(message.match(/^Something went wrong! Try pasting the text of this post instead, or adding a different link/).nil?).to be(false)
    end

    it "should tag media from tags list" do
      page = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .click_media

      new_tag = Time.now.to_i.to_s
      expect(page.contains_string?("Tagged \##{new_tag}")).to be(false)
      page.add_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(true)
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

    it "should set status to media as a command" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # Add a status as a command
      fill_field('#cmd-input', '/status In Progress')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that status was added to annotations list
      expect(@driver.page_source.include?('Status')).to be(true)

      # Reload the page and verify that status is still there
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('Status')).to be(true)
    end

    it "should flag media as a command" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .login_with_email(email: @email, password: @password)
          .create_media(input: "Media #{Time.now.to_i}")

      expect(media_pg.contains_string?('Flag')).to be(false)

      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit

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

    it "should change a media status via the dropdown menu" do
      media_pg = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: @password)
          .create_team
          .create_project
          .create_media(input: "This is true")
      expect(media_pg.status_label).to eq('UNSTARTED')

      media_pg.change_status(:verified)
      expect(media_pg.status_label).to eq('VERIFIED')
      expect(media_pg.contains_element?('.annotation__status--verified')).to be(true)
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
        .create_media(input: "Media #{Time.now.to_i}")
      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit
      sleep 1
      notes_count = get_element('.media-detail__check-notes-count')
      expect(notes_count.text == '1 note').to be(true)
      media_pg.element('.annotation__delete').click
      sleep 1
      expect(notes_count.text == '0 notes').to be(true)
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

    # it "should edit the title of a media" do
    #   skip("Needs to be implemented")
    # end
  end
end
