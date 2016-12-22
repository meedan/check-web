require 'selenium-webdriver'
require 'yaml'
require File.join(File.expand_path(File.dirname(__FILE__)), 'spec_helper')
require File.join(File.expand_path(File.dirname(__FILE__)), 'app_spec_helpers')

describe 'app' do

  # Helpers

  include AppSpecHelpers

  # Start a webserver for the web app before the tests

  before :all do
    @wait = Selenium::WebDriver::Wait.new(timeout: 5)

    @email = 'sysops+' + Time.now.to_i.to_s + '@meedan.com'
    @source_url = 'https://twitter.com/ironmaiden?timestamp=' + Time.now.to_i.to_s
    @media_url = 'https://twitter.com/meedan/status/773947372527288320/?t=' + Time.now.to_i.to_s
    @config = YAML.load_file('config.yml')
    $source_id = nil
    $media_id = nil

    FileUtils.cp(@config['config_file_path'], '../build/web/js/config.js') unless @config['config_file_path'].nil?
  end

  # Close the testing webserver after all tests run

  after :all do
    FileUtils.cp('../config.js', '../build/web/js/config.js')
  end

  # Start Google Chrome before each test

  before :each do
    #@driver = Selenium::WebDriver.for :remote, url: @config['chromedriver_url'], :desired_capabilities => :chrome
    proxy = Selenium::WebDriver::Proxy.new(
      :http     => @config['proxy'],
      :ftp      => @config['proxy'],
      :ssl      => @config['proxy']
    )
    caps = Selenium::WebDriver::Remote::Capabilities.chrome(:proxy => proxy)
    @driver = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => @config['chromedriver_url'])
  end

  # Close Google Chrome after each test

  after :each do |example|
    if example.exception
      require 'rest-client'
      path = '/tmp/' + (0...8).map{ (65 + rand(26)).chr }.join + '.png'
      @driver.save_screenshot(path)
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

    it "should login using Facebook" do
      login_with_facebook
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['facebook_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should register using e-mail" do
      register_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should create a project for a team" do
      login_with_email
      @driver.navigate.to @config['self_url']
      sleep 1
      title = "Project #{Time.now}"
      fill_field('#create-project-title', title)
      @driver.action.send_keys(:enter).perform
      sleep 5
      expect(@driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
      link = get_element('.team-sidebar__project-link')
      expect(link.text == title).to be(true)
    end

    it "should create project media" do
      login_with_email
      sleep 5

      fill_field('#create-media-input', 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      media_link = @driver.current_url.to_s

      @driver.navigate.to @config['self_url']
      sleep 3

      expect(@driver.page_source.include?('Added')).to be(true)
      expect(@driver.page_source.include?('User With Email')).to be(true)
      status = get_element('.media-status__label')
      expect(status.text == 'IN PROGRESS').to be(false)

      @driver.navigate.to media_link
      sleep 3
      fill_field('#cmd-input', '/status In Progress')
      @driver.action.send_keys(:enter).perform
      sleep 3

      @driver.navigate.to @config['self_url']
      sleep 5

      expect(@driver.page_source.include?('Added')).to be(true)
      expect(@driver.page_source.include?('User With Email')).to be(true)
      status = get_element('.media-status__label')
      expect(status.text == 'IN PROGRESS').to be(true)
    end

    it "should register and redirect to newly created media" do
      login_with_email
      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 1
      press_button('#create-media-submit')
      sleep 20
      $media_id = @driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
      expect($media_id.nil?).to be(false)
    end

    it "should upload image when registering" do
      email = @email + '.br'
      @driver.navigate.to @config['self_url']
      sleep 1
      @driver.find_element(:xpath, "//a[@id='login-email']").click
      sleep 1
      @driver.find_element(:xpath, "//button[@id='register-or-login']").click
      sleep 1
      fill_field('.login-email__name input', 'User With Email And Photo')
      fill_field('.login-email__email input', email)
      fill_field('.login-email__password input', '12345678')
      fill_field('.login-email__password-confirmation input', '12345678')
      file = File.join(File.dirname(__FILE__), 'test.png')
      fill_field('input[type=file]', file, :css, false)
      press_button('#submit-register-or-login')
      sleep 3
      confirm_email(email)
      sleep 1
      login_with_email(true, email)
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 10
      avatar = get_element('.source-avatar')
      expect(avatar.attribute('src').match(/test\.png$/).nil?).to be(false)
    end

    it "should redirect to 404 page" do
      @driver.navigate.to @config['self_url'] + '/something-that-does-not-exist'
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should click to go to Terms of Service" do
      @driver.navigate.to @config['self_url'] + '/tos'
      title = get_element('.main-title')
      expect(title.text == 'Terms of Service').to be(true)
    end

    it "should redirect to login screen if not logged in" do
      @driver.navigate.to @config['self_url'] + '/teams'
      title = get_element('.login-menu__heading')
      expect(title.text == 'SIGN IN').to be(true)
    end

    it "should login using Twitter" do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should login using Slack" do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should login with e-mail" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should show team options at /teams" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/teams'
      sleep 3
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should go to user page" do
      login_with_email
      @driver.find_element(:css, '.fa-ellipsis-h').click
      sleep 1
      @driver.find_element(:xpath, "//a[@id='link-me']").click
      expect((@driver.current_url.to_s =~ /\/me$/).nil?).to be(false)
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go to source page through source/:id" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 5
      source_id = $source_id = @driver.find_element(:css, '.source').attribute('data-id')
      @driver.navigate.to team_url('source/' + source_id.to_s)
      sleep 1
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go to source page through user/:id" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 5
      user_id = @driver.find_element(:css, '.source').attribute('data-user-id')
      @driver.navigate.to @config['self_url'] + '/user/' + user_id.to_s
      sleep 1
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go back and forward in the history" do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.to @config['self_url'] + '/tos'
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
    end

    it "should tag source from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.find_elements(:css, '.ReactTags__tag').empty?).to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(false)

      # Add a tag from tags list
      fill_field('.ReactTags__tagInput input', 'selenium')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged #selenium')).to be(true)
    end

    it "should tag source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged #command')).to be(false)

      # Add a tag as a command
      fill_field('#cmd-input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
    end

    it "should redirect to access denied page" do
      login_with_twitter
      @driver.navigate.to team_url('source/' + $source_id.to_s)
      title = get_element('.main-title')
      expect(title.text == 'Access Denied').to be(true)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
    end

    it "should comment source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
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
      @driver.navigate.to team_url('sources/new')
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
      @driver.navigate.to team_url('sources/new')
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
      @driver.navigate.to team_url('sources/new')
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
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # Add tags as a command
      fill_field('#cmd-input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tags were added to tags list and annotations list
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'foo' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #foo')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bar' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bar')).to be(true)
    end

    it "should tag source multiple times with commas from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # Add tags from tags list
      fill_field('.ReactTags__tagInput input', 'bla,bli')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tags were added to tags list and annotations list
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bla')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bli' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged #bli')).to be(true)
    end

    it "should not add a duplicated tag from tags list" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # Validate assumption that tag does not exist
      get_element('.media-actions').click
      get_element('.media-actions__menu-item').click
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.size == 0).to be(true)

      # Add tag from tags list
      fill_field('.ReactTags__tagInput input', 'bla')
      @driver.action.send_keys(:enter).perform
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'bla').to be(true)

      # Try to add duplicate
      fill_field('.ReactTags__tagInput input', 'bla')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag is not added and that error message is displayed
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.size == 1).to be(true)
      expect(@driver.page_source.include?('This tag already exists')).to be(true)
    end

    it "should not add a duplicated tag from command line" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # Validate assumption that tag exists
      get_element('.media-actions').click
      get_element('.media-actions__menu-item').click
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.size == 1).to be(true)

      # Try to add duplicate from command line
      fill_field('#cmd-input', '/tag bla')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag is not added and that error message is displayed
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.size == 1).to be(true)
      expect(@driver.page_source.include?('This tag already exists')).to be(true)
    end

    it "should not create duplicated media if registered" do
      login_with_email
      sleep 3
      fill_field('#create-media-input', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/media\/[0-9]+$/).nil?).to be(false)
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
      expect(message == 'Something went wrong! Try pasting the text of this post instead, or adding a different link.').to be(true)
    end

    it "should tag media from tags list" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged #tellurium')).to be(false)

      # Add a tag from tags list
      get_element('.media-actions').click
      get_element('.media-actions__menu-item').click
      fill_field('.ReactTags__tagInput input', 'tellurium')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'tellurium').to be(true)
      expect(@driver.page_source.include?('Tagged #tellurium')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      get_element('.media-actions').click
      get_element('.media-actions__menu-item').click
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'tellurium').to be(true)
      expect(@driver.page_source.include?('Tagged #tellurium')).to be(true)
    end

    it "should tag media as a command" do
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged #command')).to be(false)

      # Add a tag as a command
      fill_field('#cmd-input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.media-tags__tag')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.media-tags__tag')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
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
      login_with_email
      @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
      sleep 1

      # First, verify that there isn't any flag
      expect(@driver.page_source.include?('Flag')).to be(false)

      # Add a flag as a command
      fill_field('#cmd-input', '/flag Spam')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that flag was added to annotations list
      expect(@driver.page_source.include?('Flag')).to be(true)

      # Reload the page and verify that flag is still there
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('Flag')).to be(true)
    end

    it "should edit project" do
      login_with_email
      @driver.navigate.to @config['self_url']
      sleep 1
      title = "Project #{Time.now}"
      fill_field('#create-project-title', title)
      @driver.action.send_keys(:enter).perform
      sleep 5

      @driver.find_element(:css, '.project-header__project-settings-icon').click
      sleep 1
      @driver.find_element(:css, '.project-header__project-setting--edit').click
      sleep 1
      fill_field('.project-header__project-name-input', 'Changed title')
      fill_field('.project-header__project-description-input', 'Set description')
      @driver.find_element(:css, '.project-header__project-editing-button--cancel').click
      sleep 3
      expect(@driver.page_source.include?('Changed title')).to be(false)
      expect(@driver.page_source.include?('Set description')).to be(false)

      @driver.find_element(:css, '.project-header__project-settings-icon').click
      sleep 1
      @driver.find_element(:css, '.project-header__project-setting--edit').click
      sleep 1
      fill_field('.project-header__project-name-input', 'Changed title')
      fill_field('.project-header__project-description-input', 'Set description')
      @driver.find_element(:css, '.project-header__project-editing-button--save').click
      sleep 3
      expect(@driver.page_source.include?('Changed title')).to be(true)
      expect(@driver.page_source.include?('Set description')).to be(true)
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
      register_with_email(true, 'sysops+' + Time.now.to_i.to_s + '@meedan.com')
      wait = Selenium::WebDriver::Wait.new(timeout: 10)
      wait.until { @driver.find_element(:css, '.team') }
      create_project
      wait.until { @driver.find_element(:css, '.project') }
      create_media('https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      wait.until { @driver.find_element(:css, '.media') }

      current_status = @driver.find_element(:css, '.media-status__label')
      expect(current_status.text == 'UNSTARTED').to be(true)

      current_status.click
      verified_menu_item = (wait.until { @driver.find_element(:css, '.media-status__menu-item--verified') })
      verified_menu_item.click
      sleep 3
      current_status = @driver.find_element(:css, '.media-status__label')

      expect(current_status.text == 'VERIFIED').to be(true)
      expect(!!@driver.find_element(:css, '.annotation__status--verified')).to be(true)
    end

    it "should logout" do
      unless login_or_register_with_email
        create_team
        create_project
      end
      @driver.navigate.to @config['self_url']
      menu = @wait.until { @driver.find_element(:css, '.fa-ellipsis-h') }
      menu.click
      logout = @wait.until { @driver.find_element(:css, '.project-header__logout') }
      logout.click
      @wait.until { @driver.find_element(:css, '#login-menu') }
      expect(@driver.page_source.include? 'Sign in').to be(true)
    end

    it "should ask to join team" do
      skip("Needs to be implemented")
    end

    it "should redirect to team page if user asking to join a team is already a member" do
      skip("Needs to be implemented")
    end

    it "should reject member to join team" do
      skip("Needs to be implemented")
    end

    it "should accept member to join team" do
      skip("Needs to be implemented")
    end

    it "should change member role" do
      skip("Needs to be implemented")
    end

    it "should delete member from team" do
      skip("Needs to be implemented")
    end

    it "should delete annotation from annotations list (for media, source and project)" do
      skip("Needs to be implemented")
    end

    it "should delete tag from tags list (for media and source)" do
      skip("Needs to be implemented")
    end

    it "should edit team" do
      skip("Needs to be implemented")
    end

    it "should show 'manage team' link only to team owners" do
      skip("Needs to be implemented")
    end

    it "should show 'edit project' link only to users with 'update project' permission" do
      skip("Needs to be implemented")
    end

    it "should switch teams" do
      login_or_register_with_email
      @driver.navigate.to "#{@config['self_url']}/teams/new"
      create_team
      wait = Selenium::WebDriver::Wait.new(timeout: 5)
      team_1_name = @driver.find_element(:css, '.team__name').text
      create_project
      project_1_id = (wait.until { @driver.current_url.to_s.match(/\/project\/([0-9]+)$/) })[1]
      create_media(@media_url)
      wait.until { @driver.find_element(:css, '.media') }

      @driver.navigate.to "#{@config['self_url']}/teams/new"
      wait.until { @driver.find_element(:css, '.create-team') }
      create_team
      team_2_name = @driver.find_element(:css, '.team__name').text
      create_project
      project_2_id = (wait.until { @driver.current_url.to_s.match(/\/project\/([0-9]+)$/) })[1]
      create_media(@media_url)
      wait.until { @driver.find_element(:css, '.media') }

      @driver.navigate.to @config['self_url'] + '/teams'
      wait.until { @driver.find_element(:css, '.teams') }
      (wait.until { @driver.find_element(:xpath, "//*[contains(text(), '#{team_1_name}')]") }).click
      wait.until { @driver.find_element(:css, '.team') }
      expect(@driver.find_element(:css, '.team__name').text == team_1_name).to be(true)
      @driver.find_element(:css, '.team__project-link').click
      wait.until { @driver.find_element(:css, '.project') }
      url = @driver.current_url.to_s
      media_1_url = @driver.find_element(:css, '.media-detail__check-timestamp').attribute('href')
      expect(media_1_url.include?("/project/#{project_1_id}/media/")).to be(true)

      @driver.navigate.to @config['self_url'] + '/teams'
      wait.until { @driver.find_element(:css, '.teams') }
      (wait.until { @driver.find_element(:xpath, "//*[contains(text(), '#{team_2_name}')]") }).click
      wait.until { @driver.find_element(:css, '.team') }
      expect(@driver.find_element(:css, '.team__name').text == team_2_name).to be(true)
      @driver.find_element(:css, '.team__project-link').click
      wait.until { @driver.find_element(:css, '.project') }
      url = @driver.current_url.to_s
      media_2_url = @driver.find_element(:css, '.media-detail__check-timestamp').attribute('href')
      expect(media_2_url.include?("project/#{project_2_id}/media/")).to be(true)
    end

    it "should cancel request through switch teams" do
      skip("Needs to be implemented")
    end

    it "should auto refresh project page when media is created remotely" do
      skip("Needs to be implemented")
    end

    it "should give 404 when trying to acess a media that is not related to the project on the URL" do
      skip("Needs to be implemented")
    end

    it "should linkify URLs on comments" do
      skip("Needs to be implemented")
    end

    it "should add and remove suggested tags" do
      skip("Needs to be implemented")
    end

    it "should find all medias with an empty search" do
      skip("Needs to be implemented")
    end

    it "should find medias when searching by keyword" do
      skip("Needs to be implemented")
    end

    it "should find medias when searching by status" do
      skip("Needs to be implemented")
    end

    it "should find medias when searching by tag" do
      skip("Needs to be implemented")
    end

    it "should edit the title of a media" do
      skip("Needs to be implemented")
    end
  end
end
