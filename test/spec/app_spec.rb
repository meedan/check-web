require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/teams_page.rb'
require_relative './pages/page.rb'
require_relative './api_helpers.rb'

CONFIG = YAML.load_file('config.yml')

require_relative "#{CONFIG['app_name']}/custom_spec.rb"

shared_examples 'app' do |webdriver_url, browser_capabilities|

  # Helpers

  include AppSpecHelpers
  include ApiHelpers

  before :all do
    @wait = Selenium::WebDriver::Wait.new(timeout: 10)

    @email = "sysops+#{Time.now.to_i}#{Process.pid}@meedan.com"
    @password = '12345678'
    @source_name = 'Iron Maiden'
    @source_url = 'https://twitter.com/ironmaiden?timestamp=' + Time.now.to_i.to_s
    @media_url = 'https://twitter.com/meedan/status/773947372527288320/?t=' + Time.now.to_i.to_s
    @config = CONFIG
    $source_id = nil
    $media_id = nil

    begin
      FileUtils.cp('./config.js', '../build/web/js/config.js')
    rescue
      puts "Could not copy local ./config.js to ../build/web/js/"
    end

    @driver = browser_capabilities['appiumVersion'] ?
      Appium::Driver.new({ appium_lib: { server_url: webdriver_url}, caps: browser_capabilities }).start_driver :
      Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)

    api_create_team_project_and_claim(true)
  end

  after :all do
    FileUtils.cp('../config.js', '../build/web/js/config.js')
  end

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

  after :each do |example|
    if example.exception
      link = save_screenshot("Test failed: #{example.description}")
      print " [Test \"#{example.description}\" failed! Check screenshot at #{link}] "
    end
    @driver.quit
  end

  # The tests themselves start here

  context "web" do
    it "should filter by medias or sources", sources: true do
      api_create_team_project_and_link 'https://twitter.com/TheWho/status/890135323216367616'
      @driver.navigate.to @config['self_url']
      sleep 10

      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(false)
      expect(@driver.page_source.include?('Tweet by')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Sources')]").click
      sleep 10
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Tweet by')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Media')]").click
      sleep 10
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Tweet by')).to be(false)
    end

    it "should register and create a claim", users: true do
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

    it "should redirect to access denied page", other: true do
      user = api_register_and_login_with_email
      api_logout
      api_register_and_login_with_email
      me_pg = MePage.new(config: @config, driver: @driver).load
      sleep 3
      expect(@driver.page_source.include?('Access Denied')).to be(false)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(true)

      unauthorized_pg = SourcePage.new(id: user.dbid, config: @config, driver: @driver).load
      sleep 3
      expect(@driver.page_source.include?('Access Denied')).to be(true)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
    end

    include_examples "custom"

    it "should edit the title of a media", media: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      expect(media_pg.primary_heading.text).to eq('Tweet by soft landscapes')
      sleep 3 # :/ clicks can misfire if pender iframe moves the button position at the wrong moment
      media_pg.set_title('Edited media title')
      expect(media_pg.primary_heading.text).to eq('Edited media title')
      project_pg = media_pg.go_to_project
      sleep 3
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Edited media title')).to be(true)
    end

    it "should not add a duplicated tag from tags list", annotation: true do
      page = api_create_team_project_and_claim_and_redirect_to_media_page
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

    it "should display a default title for new media", media: true do
      # Tweets
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/firstdraftnews/status/835587295394869249')
      expect(media_pg.primary_heading.text).to eq('Tweet by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Tweet by First Draft')).to be(true)

      # YouTube
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
      expect(media_pg.primary_heading.text).to eq('Video by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Video by First Draft')).to be(true)

      # Facebook
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
      expect(media_pg.primary_heading.text).to eq('Facebook post by First Draft')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media-detail__heading').map(&:text).include?('Facebook post by First Draft')).to be(true)
    end

    it "should login using Slack", users: true do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h1.source__name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should localize interface based on browser language", other: true do
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

    it "should access user confirmed page", users: true do
      @driver.navigate.to @config['self_url'] + '/check/user/confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it "should access user unconfirmed page", users: true do
      @driver.navigate.to @config['self_url'] + '/check/user/unconfirmed'
      title = get_element('.main-title')
      expect(title.text == 'Error').to be(true)
    end

    it "should access user already confirmed page", users: true do
      @driver.navigate.to @config['self_url'] + '/check/user/already-confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Already Confirmed').to be(true)
    end

    it "should login using Facebook", users: true do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.login_with_facebook

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      displayed_name = me_pg.title
      expected_name = @config['facebook_name']
      expect(displayed_name).to eq(expected_name)
    end

    it "should register and login using e-mail", users: true do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      email, password = ['sysops+' + Time.now.to_i.to_s + '@meedan.com', '22345678']
      login_pg.register_and_login_with_email(email: email, password: password)

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
      displayed_name = me_pg.title
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should create a project for a team", other: true do
      team = api_create_team
      @driver.navigate.to @config['self_url']
      project_name = "Project #{Time.now}"
      project_pg = TeamPage.new(config: @config, driver: @driver).create_project(name: project_name)

      expect(project_pg.driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
      team_pg = project_pg.click_team_avatar
      expect(team_pg.project_titles.include?(project_name)).to be(true)
    end

    it "should create project media", media: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load

      expect(page.contains_string?('Tweet by Marcelo Souza')).to be(false)

      page.create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)

      page.driver.navigate.to @config['self_url']
      page.wait_for_element('.project .media-detail')

      expect(page.contains_string?('Tweet by Marcelo Souza')).to be(true)
    end

    it "should search for image", search: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

      sleep 8 # wait for Sidekiq

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      sleep 3
      imgsrc = @driver.find_element(:css, '.image-media-card img').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)
    end

    it "should upload image when registering", users: true do
      email, password, avatar = [@email + '.br', '12345678', File.join(File.dirname(__FILE__), 'test.png')]
      page = LoginPage.new(config: @config, driver: @driver).load
          .register_and_login_with_email(email: email, password: password, file: avatar)

      me_page = MePage.new(config: @config, driver: page.driver).load
      avatar = me_page.avatar
      expect(avatar.attribute('style').match(/test\.png/).nil?).to be(false)
    end

    it "should redirect to 404 page", other: true do
      @driver.navigate.to @config['self_url'] + '/something-that/does-not-exist'
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should redirect to login screen if not logged in", users: true do
      @driver.navigate.to @config['self_url'] + '/check/teams'
      title = get_element('.login__heading')
      expect(title.text == 'Sign in').to be(true)
    end

    it "should login using Twitter", users: true do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h1.source__name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should show teams at /check/teams", other: true do
      api_create_team
      @driver.navigate.to @config['self_url'] + '/check/teams'
      sleep 2
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should go to source page through user/:id", sources: true do
      user = api_register_and_login_with_email
      @driver.navigate.to @config['self_url'] + '/check/user/' + user.dbid.to_s
      sleep 1
      title = get_element('.source__name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go back and forward in the history", other: true do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.to @config['self_url'] + '/check/tos'
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
    end

    it "should create source and redirect to newly created source", sources: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 15
      @driver.find_element(:css, '#create-media__source').click
      sleep 1
      fill_field('#create-media-source-name-input', @source_name)
      fill_field('#create-media-source-url-input', @source_url)
      sleep 1
      press_button('#create-media-submit')
      sleep 15
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(false)
      title = get_element('.source__name').text
      expect(title == @source_name).to be(true)
    end

    it "should not create duplicated source", sources: true do
      api_create_team_project_and_source('Megadeth', 'https://twitter.com/megadeth')
      @driver.navigate.to @config['self_url']
      sleep 5
      @driver.find_element(:css, '#create-media__source').click
      sleep 1
      fill_field('#create-media-source-name-input', 'Megadeth')
      fill_field('#create-media-source-url-input', 'https://twitter.com/megadeth')
      sleep 1
      expect(@driver.page_source.include?('Source exists')).to be(false)
      press_button('#create-media-submit')
      sleep 15
      expect(@driver.page_source.include?('Source exists')).to be(true)
    end

    it "should tag source as a command", sources: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      sleep 3
      @driver.find_element(:css, '.source__tab-button-notes').click

      expect(@driver.page_source.include?('Tagged #command')).to be(false)

      fill_field('#cmd-input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5

      expect(@driver.page_source.include?('Tagged #command')).to be(true)

      @driver.navigate.refresh
      sleep 5
      @driver.find_element(:css, '.source__tab-button-notes').click
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
    end

    it "should comment source as a command", sources: true do
      api_create_team_project_and_source_and_redirect_to_source('The Beatles', 'https://twitter.com/thebeatles')
      sleep 3
      @driver.find_element(:css, '.source__tab-button-notes').click

      expect(@driver.page_source.include?('This is my comment')).to be(false)

      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 5

      expect(@driver.page_source.include?('This is my comment')).to be(true)

      @driver.navigate.refresh
      sleep 5
      @driver.find_element(:css, '.source__tab-button-notes').click
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should not create report as source", sources: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 5
      @driver.find_element(:css, '#create-media__source').click
      sleep 1
      fill_field('#create-media-source-url-input', 'https://twitter.com/IronMaiden/status/832726327459446784')
      sleep 1
      press_button('#create-media-submit')
      sleep 15
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
      message = get_element('.message').text
      expect(message.match(/Sorry, this is not a profile/).nil?).to be(false)
    end

    it "should tag source multiple times with commas with command", sources: true do
      api_create_team_project_and_source_and_redirect_to_source('Motorhead', 'https://twitter.com/mymotorhead')
      sleep 5
      @driver.find_element(:css, '.source__tab-button-notes').click

      fill_field('#cmd-input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 5

      expect(@driver.page_source.include?('Tagged #foo')).to be(true)
      expect(@driver.page_source.include?('Tagged #bar')).to be(true)
    end

    # it "should edit basic source data (name, description/bio, avatar)" do
    #   skip("Needs to be implemented")
    # end

    # it "should add and remove accounts to sources" do
    #   skip("Needs to be implemented")
    # end

    # it "should edit source metadata (contact, phone, location, organization, other)" do
    #   skip("Needs to be implemented")
    # end

    # it "should add and remove tags" do
    #   skip("Needs to be implemented")
    # end

    # it "should add and remove languages" do
    #   skip("Needs to be implemented")
    # end

    it "should not add a duplicated tag from command line", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page

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
      expect(@driver.page_source.include?('Tag already exists')).to be(true)
    end

    it "should not create duplicated media", media: true do
      api_create_team_project_and_link_and_redirect_to_media_page @media_url
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

    it "should tag media from tags list", annotation: true do
      page = api_create_team_project_and_claim_and_redirect_to_media_page

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

    it "should tag media as a command", annotation: true do
      page = api_create_team_project_and_claim_and_redirect_to_media_page

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

    it "should comment media as a command", annotation: true do
      api_create_team_project_and_claim_and_redirect_to_media_page

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

    it "should flag media as a command", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page

      expect(media_pg.contains_string?('Flag')).to be(false)

      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit
      sleep 2

      expect(media_pg.contains_string?('Flag')).to be(true)
      media_pg.driver.navigate.refresh
      media_pg.wait_for_element('.media')
      expect(media_pg.contains_string?('Flag')).to be(true)
    end

    it "should edit project", other: true do
      api_create_team_and_project
      project_pg = ProjectPage.new(config: @config, driver: @driver).load

      new_title = "Changed title #{Time.now.to_i}"
      new_description = "Set description #{Time.now.to_i}"
      expect(project_pg.contains_string?(new_title)).to be(false)
      expect(project_pg.contains_string?(new_description)).to be(false)

      project_pg.edit(title: new_title, description: new_description)

      expect(@driver.page_source.include?(new_title)).to be(true)
      expect(@driver.page_source.include?(new_description)).to be(true)
    end

    it "should redirect to 404 page if id does not exist", other: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 3
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(/project\/([0-9]+).*/, 'project/999')
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
      expect((@driver.current_url.to_s =~ /\/404$/).nil?).to be(false)
    end

    it "should logout", users: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      page = ProjectPage.new(config: @config, driver: @driver).logout

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

    it "should navigate between teams", other: true do
      # setup
      user = api_register_and_login_with_email
      team = request_api 'team', { name: 'Team 1', email: user.email, slug: "team-1-#{Time.now.to_i}" }
      request_api 'project', { title: 'Team 1 Project', team_id: team.dbid }
      team = request_api 'team', { name: 'Team 2', email: user.email, slug: "team-2-#{Time.now.to_i}" }
      request_api 'project', { title: 'Team 2 Project', team_id: team.dbid }

      # test
      page = TeamsPage.new(config: @config, driver: @driver).load.select_team(name: 'Team 1')

      expect(page.team_name).to eq('Team 1')
      expect(page.project_titles.include?('Team 1 Project')).to be(true)
      expect(page.project_titles.include?('Team 2 Project')).to be(false)

      page = TeamsPage.new(config: @config, driver: page.driver).load.select_team(name: 'Team 2')

      expect(page.team_name).to eq('Team 2')
      expect(page.project_titles.include?('Team 2 Project')).to be(true)
      expect(page.project_titles.include?('Team 1 Project')).to be(false)
    end

    it "should update notes count after delete annotation", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      media_pg.fill_input('#cmd-input', 'Test')
      media_pg.element('#cmd-input').submit
      sleep 1
      notes_count = get_element('.media-detail__check-notes-count')
      expect(notes_count.text == '2 notes').to be(true)
      media_pg.delete_annotation
      sleep 1
      expect(notes_count.text == '1 note').to be(true)
    end

    it "should auto refresh project when media is created", media: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']

      url = @driver.current_url
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

    it "should auto refresh media when annotation is created", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
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

    it "should add image to media comment", annotation: true do
      api_create_team_project_and_claim_and_redirect_to_media_page

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

    it "should add, edit, answer, update answer and delete task", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
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

    it "should search for reverse images", search: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'https://www.instagram.com/p/BRYob0dA1SC/'
      sleep 1
      expect(@driver.page_source.include?('This item contains at least one image. Click Search to look for potential duplicates on Google.')).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      @driver.find_element(:css, '.annotation__reverse-image-search').click
      sleep 3
      @driver.switch_to.window(@driver.window_handles.last)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    it "should refresh media", media: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
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

    it "should search by project", search: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(true)
      @driver.find_element(:xpath, "//li[contains(text(), 'Project')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(false)
      expect((@driver.title =~ /Project/).nil?).to be(false)
      @driver.find_element(:xpath, "//li[contains(text(), 'Project')]").click
      sleep 10
      expect((@driver.title =~ /Project/).nil?).to be(true)
    end

    it "should search and change sort criteria", search: true do
      api_create_claim_and_go_to_search_page
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

    it "should search and change sort order", search: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Newest')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Oldest')]").click
      sleep 20
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search by project through URL", search: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"projects"%3A%5B0%5D%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(false)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected')
      expect(selected.size == 3).to be(true)
    end

    it "should change search sort criteria through URL", search: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort"%3A"recent_activity"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Recent activity', 'Newest first', 'Media'].sort).to be(true)
    end

    it "should change search sort order through URL", search: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort_type"%3A"ASC"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Created', 'Oldest first', 'Media'].sort).to be(true)
    end

    it "should not reset password", users: true do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(true)
      expect(@driver.page_source.include?('Password reset sent')).to be(false)
    end

    it "should reset password", users: true do
      user = api_create_and_confirm_user
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password(user.email)
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(false)
      expect(@driver.page_source.include?('Password reset sent')).to be(true)
    end

    it "should set metatags", other: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'https://twitter.com/marcouza/status/875424957613920256'
      sleep 2
      request_api('make_team_public', { slug: get_team })
      sleep 1
      url = @driver.current_url.to_s
      @driver.navigate.to url
      site = @driver.find_element(:css, 'meta[name="twitter\\:site"]').attribute('content')
      expect(site == @config['app_name']).to be(true)
      twitter_title = @driver.find_element(:css, 'meta[name="twitter\\:title"]').attribute('content')
      expect(twitter_title == 'This is a test').to be(true)
    end

    it "should embed", media: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 2
      request_api('make_team_public', { slug: get_team })

      @driver.navigate.refresh
      sleep 2
      @driver.find_element(:css, '.media-actions__icon').click
      sleep 1
      if @config['app_name'] == 'bridge'
        expect(@driver.page_source.include?('Embed...')).to be(false)
        @driver.navigate.to "#{@driver.current_url}/embed"
        sleep 2
        expect(@driver.page_source.include?('Not available')).to be(true)
      elsif @config['app_name'] == 'check'
        expect(@driver.page_source.include?('Embed...')).to be(true)
        url = @driver.current_url.to_s
        @driver.find_element(:css, '#media-actions__embed').click
        sleep 2
        expect(@driver.current_url.to_s == "#{url}/embed").to be(true)
        expect(@driver.page_source.include?('Not available')).to be(false)
        @driver.find_element(:css, '#media-embed__actions-customize').click
        sleep 1
        @driver.find_elements(:css, '#media-embed__customization-menu input[type=checkbox]').map(&:click)
        sleep 1
        @driver.find_elements(:css, 'body').map(&:click)
        sleep 1
        @driver.find_element(:css, '#media-embed__actions-copy').click
        sleep 1
        @driver.navigate.to 'https://pastebin.mozilla.org/'
        @driver.find_element(:css, '#code').send_keys(' ')
        @driver.action.send_keys(:control, 'v').perform
        sleep 1
        expect((@driver.find_element(:css, '#code').attribute('value') =~ /hide_tasks%3D1%26hide_notes%3D1/).nil?).to be(false)
        sleep 5
      end
    end

    it "should add, edit, answer, update answer and delete geolocation task", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 3

      # Create a task
      expect(@driver.page_source.include?('Where?')).to be(false)
      expect(@driver.page_source.include?('Task "Where?" created by')).to be(false)
      @driver.find_element(:css, '.create-task__add-button').click
      sleep 1
      @driver.find_element(:css, '.create-task__add-geolocation').click
      sleep 1
      fill_field('#task-label-input', 'Where?')
      @driver.find_element(:css, '.create-task__dialog-submit-button').click
      sleep 2
      expect(@driver.page_source.include?('Where?')).to be(true)
      expect(@driver.page_source.include?('Task "Where?" created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('Task "Where?" answered by')).to be(false)
      @driver.find_element(:css, '.task__label').click
      fill_field('textarea[name="response"]', 'Salvador')
      fill_field('textarea[name="coordinates"]', '-12.9015866, -38.560239')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.include?('Task "Where?" answered by')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Task "Where?" edited to "Where was it?" by')).to be(false)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').first.click
      update_field('textarea[name="label"]', 'Where was it?')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "Where?" edited to "Where was it?" by')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Where was it?" answered by User With Email: "Vancouver"')).to be(false)
      @driver.find_element(:css, '#task__edit-response-button').click
      update_field('textarea[name="response"]', 'Vancouver')
      update_field('textarea[name="coordinates"]', '49.2577142, -123.1941156')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Where was it?" answered by User With Email: "Vancouver"')).to be(true)

      # Delete task
      expect(@driver.page_source.include?('Where was it')).to be(true)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').last.click
      @driver.switch_to.alert.accept
      sleep 3
      expect(@driver.page_source.include?('Where was it')).to be(false)
    end

    it "should add, edit, answer, update answer and delete datetime task", annotation: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 5

      # Create a task
      expect(@driver.page_source.include?('When?')).to be(false)
      expect(@driver.page_source.include?('Task "When?" created by')).to be(false)
      @driver.find_element(:css, '.create-task__add-button').click
      sleep 1
      @driver.find_element(:css, '.create-task__add-datetime').click
      sleep 1
      fill_field('#task-label-input', 'When?')
      @driver.find_element(:css, '.create-task__dialog-submit-button').click
      sleep 2
      expect(@driver.page_source.include?('When?')).to be(true)
      expect(@driver.page_source.include?('Task "When?" created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('Task "When?" answered by')).to be(false)
      @driver.find_element(:css, '.task__label').click
      fill_field('input[name="hour"]', '23')
      fill_field('input[name="minute"]', '59')
      @driver.find_element(:css, '#task__response-date').click
      sleep 2
      @driver.find_elements(:css, 'button').last.click
      sleep 1
      fill_field('textarea[name="note"]', 'Test')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.include?('Task "When?" answered by')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Task "When?" edited to "When was it?" by')).to be(false)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').first.click
      update_field('textarea[name="label"]', 'When was it?')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "When?" edited to "When was it?" by')).to be(true)

      # Edit task response
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(false)
      @driver.find_element(:css, '#task__edit-response-button').click
      update_field('input[name="hour"]', '12')
      update_field('input[name="minute"]', '34')
      update_field('textarea[name="note"]', '')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(true)

      # Delete task
      expect(@driver.page_source.include?('When was it')).to be(true)
      @driver.find_element(:css, '.task__actions svg').click
      @driver.find_elements(:css, '.media-actions__menu--active span').last.click
      @driver.switch_to.alert.accept
      sleep 3
      expect(@driver.page_source.include?('When was it')).to be(false)
    end
  end
end
