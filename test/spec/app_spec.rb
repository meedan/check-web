require 'selenium-webdriver'
require 'yaml'
require File.join(File.expand_path(File.dirname(__FILE__)), 'app_spec_helpers')

describe 'app' do

  # Helpers

  include AppSpecHelpers

  # Start a webserver for the web app before the tests

  before :all do
    @email = 'sysops+' + Time.now.to_i.to_s + '@meedan.com'
    @source_url = 'https://www.facebook.com/ironmaiden/?fref=ts&timestamp=' + Time.now.to_i.to_s
    @media_url = 'https://www.facebook.com/ironmaiden/posts/10153654402607051/?t=' + Time.now.to_i.to_s
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
    @driver = Selenium::WebDriver.for :remote, url: @config['chromedriver_url'], :desired_capabilities => :chrome
  end

  # Close Google Chrome after each test

  after :each do
    @driver.quit
  end

  # The tests themselves start here

  context "web" do
    it "should upload image when registering" do
      @driver.navigate.to @config['self_url']
      sleep 1
      @driver.find_element(:xpath, "//a[@id='login-email']").click
      sleep 1
      @driver.find_element(:xpath, "//button[@id='register-or-login']").click
      sleep 1
      fill_field('.login-name input', 'User With Email And Photo')
      fill_field('.login-email input', @email + '.br')
      fill_field('.login-password input', '12345678')
      fill_field('.login-password-confirmation input', '12345678')
      file = File.join(File.dirname(__FILE__), 'test.png')
      fill_field('input[type=file]', file, :css, false)
      press_button('#submit-register-or-login')
      sleep 5
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

    it "should login using Facebook" do
      login_with_facebook
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['facebook_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should login using Slack" do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should register using e-mail" do
      register_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      displayed_name = get_element('h2.source-name').text
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should login with e-mail" do
      login_with_email
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

    it "should show team options at /teams" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/teams'
      sleep 3
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should go to user page" do
      login_with_email
      @driver.find_element(:css, '.fa-gear').click
      sleep 1
      @driver.find_element(:xpath, "//a[@id='link-me']").click
      expect(@driver.current_url.to_s == @config['self_url'] + '/me').to be(true)
      title = get_element('.source-name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go to source page through team/:id/source/:id" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 5
      source_id = $source_id = @driver.find_element(:css, '.source').attribute('data-id')
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/source/' + source_id.to_s
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
      expect(@driver.current_url.to_s == @config['self_url'] + '/').to be(true)
      @driver.navigate.to @config['self_url'] + '/tos'
      expect(@driver.current_url.to_s == @config['self_url'] + '/tos').to be(true)
      @driver.navigate.back
      expect(@driver.current_url.to_s == @config['self_url'] + '/').to be(true)
      @driver.navigate.forward
      expect(@driver.current_url.to_s == @config['self_url'] + '/tos').to be(true)
    end

    it "should tag source from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.find_elements(:css, '.ReactTags__tag').empty?).to be(true)
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(false)

      # Add a tag from tags list
      fill_field('.ReactTags__tagInput input', 'selenium')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(true)
    end

    it "should tag source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged as "command"')).to be(false)

      # Add a tag as a command
      fill_field('.cmd-input input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged as "command"')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged as "command"')).to be(true)
    end

    it "should redirect to access denied page" do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/source/' + $source_id.to_s
      title = get_element('.main-title')
      expect(title.text == 'Access Denied').to be(true)
      expect(@driver.current_url.to_s == @config['self_url'] + '/forbidden').to be(true)
    end

    it "should comment source as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)

      # Add a comment as a command
      fill_field('.cmd-input input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment')).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 1
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should preview source" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/sources/new'
      sleep 1
      expect(@driver.find_elements(:xpath, "//*[contains(@id, 'pender-iframe')]").empty?).to be(true)
      fill_field('#create-account-url', 'https://www.facebook.com/ironmaiden/?fref=ts')
      press_button('#create-account-preview')
      sleep 15
      expect(@driver.find_elements(:xpath, "//*[contains(@id, 'pender-iframe')]").empty?).to be(false)
    end

    it "should create source and redirect to newly created source" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/sources/new'
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
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/sources/new'
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
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/sources/new'
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
      fill_field('.cmd-input input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tags were added to tags list and annotations list
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'foo' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged as "foo"')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bar' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged as "bar"')).to be(true)
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
      expect(@driver.page_source.include?('Tagged as "bla"')).to be(true)

      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bli' }
      expect(tag.empty?).to be(false)
      expect(@driver.page_source.include?('Tagged as "bli"')).to be(true)
    end

    it "should not add a duplicated tag from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # Add tag from tags list
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
      @driver.navigate.to @config['self_url'] + '/me'
      sleep 1

      # Add tag from tags list
      fill_field('.cmd-input input', '/tag bla')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag is not added and that error message is displayed
      tag = @driver.find_elements(:css, '.ReactTags__tag span').select{ |s| s.text == 'bla' }
      expect(tag.size == 1).to be(true)
      expect(@driver.page_source.include?('This tag already exists')).to be(true)
    end

    it "should preview media if registered" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/medias/new'
      sleep 1
      expect(@driver.find_elements(:xpath, "//*[contains(@id, 'pender-iframe')]").empty?).to be(true)
      fill_field('#create-media-url', @media_url)
      press_button('#create-media-preview')
      sleep 10
      expect(@driver.find_elements(:xpath, "//*[contains(@id, 'pender-iframe')]").empty?).to be(false)
    end

    it "should register and redirect to newly created media" do
      login_with_email
      sleep 3
      fill_field('#create-media-url', @media_url)
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      $media_id = @driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
      expect($media_id.nil?).to be(false)
    end

    it "should not create duplicated media if registered" do
      login_with_email
      sleep 3
      fill_field('#create-media-url', @media_url)
      sleep 2
      press_button('#create-media-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/media\/[0-9]+$/).nil?).to be(false)
    end

    it "should not create source as media if registered" do
      login_with_email
      sleep 3
      fill_field('#create-media-url', 'https://www.facebook.com/ironmaidenbeer/?fref=ts')
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      expect(@driver.current_url.to_s.match(/\/media\/[0-9]+$/).nil?).to be(true)
      message = get_element('.create-media .message').text
      expect(message == 'Validation failed: Sorry, this is not a valid media item').to be(true)
    end

    it "should tag media from tags list" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/project/' + get_project + '/media/' + $media_id
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(false)

      # Add a tag from tags list
      fill_field('.ReactTags__tagInput input', 'selenium')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'selenium').to be(true)
      expect(@driver.page_source.include?('Tagged as "selenium"')).to be(true)
    end

    it "should tag media as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/project/' + get_project + '/media/' + $media_id
      sleep 1

      # First, verify that there isn't any tag
      expect(@driver.page_source.include?('Tagged as "command"')).to be(false)

      # Add a tag as a command
      fill_field('.cmd-input input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      # Verify that tag was added to tags list and annotations list
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged as "command"')).to be(true)

      # Reload the page and verify that tags are still there
      @driver.navigate.refresh
      sleep 1
      tag = get_element('.ReactTags__tag span')
      expect(tag.text == 'command').to be(true)
      expect(@driver.page_source.include?('Tagged as "command"')).to be(true)
    end

    it "should comment media as a command" do
      login_with_email
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/project/' + get_project + '/media/' + $media_id
      sleep 1

      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)

      # Add a comment as a command
      fill_field('.cmd-input input', '/comment This is my comment')
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
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/project/' + get_project + '/media/' + $media_id
      sleep 1

      # First, verify that there isn't any status
      expect(@driver.page_source.include?('Status')).to be(false)

      # Add a status as a command
      fill_field('.cmd-input input', '/status In Progress')
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
      @driver.navigate.to @config['self_url'] + '/team/' + get_team + '/project/' + get_project + '/media/' + $media_id
      sleep 1

      # First, verify that there isn't any flag
      expect(@driver.page_source.include?('Flag')).to be(false)

      # Add a flag as a command
      fill_field('.cmd-input input', '/flag Spam')
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
    #   fill_field('.cmd-input input', '/comment This is my comment')
    #   @driver.action.send_keys(:enter).perform
    #   sleep 5

    #   # Verify that comment was added to annotations list
    #   expect(@driver.page_source.include?('This is my comment')).to be(true)

    #   # Reload the page and verify that comment is still there
    #   @driver.navigate.refresh
    #   sleep 3
    #   expect(@driver.page_source.include?('This is my comment')).to be(true)
    # end

    it "should create project media" do
      login_with_email
      sleep 5

      fill_field('#create-media-url', 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      media_link = @driver.current_url.to_s

      @driver.navigate.to @config['self_url']
      sleep 3

      expect(@driver.page_source.include?('This is a test')).to be(true)
      expect(@driver.page_source.include?('Not Applicable')).to be(false)

      @driver.navigate.to media_link
      sleep 3
      fill_field('.cmd-input input', '/status Not Applicable')
      @driver.action.send_keys(:enter).perform
      sleep 3

      @driver.navigate.to @config['self_url']
      sleep 5

      expect(@driver.page_source.include?('This is a test')).to be(true)
      expect(@driver.page_source.include?('Not Applicable')).to be(true)
    end

    it "should redirect to 404 page if id does not exist" do
      login_with_email
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(/project\/([0-9]+).*/, 'project/99999999999999')
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
      expect(@driver.current_url.to_s == @config['self_url'] + '/404').to be(true)
    end

    it "should change a media status via the dropdown menu" do
      login_with_email
      sleep 5
      
      fill_field('#create-media-url', 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      sleep 1
      press_button('#create-media-submit')
      sleep 10
      media_link = @driver.current_url.to_s

      current_status = @driver.find_element(:css, '.media-status__label')
      expect(current_status.text == 'UNDETERMINED').to be(true)

      current_status.click
      sleep 1
      verified_menu_item = @driver.find_element(:css, '.media-status__menu-item--verified')
      verified_menu_item.click
      sleep 3
      current_status = @driver.find_element(:css, '.media-status__label')
      
      expect(current_status.text == 'VERIFIED').to be(true)
      expect(@driver.page_source.include? 'Status set to "Verified"').to be(true)
    end

    it "should logout" do
      skip("Needs to be implemented")
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

    it "should show 'manage team' link only to team owners" do
      skip("Needs to be implemented")
    end

    it "should show 'edit project' link only to users with 'update project' permission" do
      skip("Needs to be implemented")
    end

    it "should switch teams" do
      skip("Needs to be implemented")
    end

    it "should cancel request through switch teams" do
      skip("Needs to be implemented")
    end
  end
end
