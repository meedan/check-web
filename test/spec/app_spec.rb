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
    @team1_slug = 'team1'+Time.now.to_i.to_s
    @user_mail = 'sysops_' + Time.now.to_i.to_s + '@meedan.com'
    begin
      FileUtils.cp('./config.js', '../build/web/js/config.js')
    rescue
      puts "Could not copy local ./config.js to ../build/web/js/"
    end

    #EXTRACT USER:PWD FROM URL FOR CHROME
    if ((browser_capabilities == :chrome) and (@config['self_url'].include? "@" and @config['self_url'].include? ":"))
      @config['self_url'] = @config['self_url'][0..(@config['self_url'].index('//')+1)] + @config['self_url'][(@config['self_url'].index('@')+1)..-1]
    end

    @driver = new_driver(webdriver_url,browser_capabilities)
    api_create_team_project_and_claim(true)
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
      print " [Test \"#{example.description}\" failed! Check screenshot at #{link}] "
    end
    @driver.quit
  end

  # The tests themselves start here

  context "web" do
    it "should filter by medias or sources", bin6: true do
      api_create_team_project_and_link 'https://twitter.com/TheWho/status/890135323216367616'
      @driver.navigate.to @config['self_url']
      sleep 10

      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(false)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Sources')]").click
      sleep 10
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)

      @driver.find_element(:xpath, "//span[contains(text(), 'Media')]").click
      sleep 10
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(false)
    end

    it "should register and create a claim", bin5: true do
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
        .logout
    end

    it "should redirect to access denied page", bin4: true do
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

    it "should edit the title of a media", bin1: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      expect(media_pg.primary_heading.text).to eq('https://t.co/i17DJNqiWX')
      sleep 3 # :/ clicks can misfire if pender iframe moves the button position at the wrong moment
      media_pg.set_title('Edited media title')
      expect(media_pg.primary_heading.text).to eq('Edited media title')
      project_pg = media_pg.go_to_project
      sleep 3
      expect(project_pg.elements('.media__heading').map(&:text).include?('Edited media title')).to be(true)
    end

    it "should not add a duplicated tag from tags list", bin3: true, quick: true  do
      page = api_create_team_project_and_claim_and_redirect_to_media_page
      new_tag = Time.now.to_i.to_s

      # Validate assumption that tag does not exist
      expect(page.has_tag?(new_tag)).to be(false)

      # Add tag from tags list
      page.add_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(true)

      # Try to add duplicate
      page.add_tag(new_tag)
      sleep 20

      # Verify that tag is not added and that error message is displayed
      expect(page.tags.count(new_tag)).to be(1)
      expect(page.contains_string?('Tag already exists')).to be(true)
    end

    it "should display a default title for new media", bin1: true, quick:true do
      # Tweets
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/firstdraftnews/status/835587295394869249')
      expect(media_pg.primary_heading.text.include?('In a chat about getting')).to be(true)
      project_pg = media_pg.go_to_project
      sleep 1
      @wait.until {
        element = @driver.find_element(:partial_link_text, 'In a chat about getting')
        expect(element.displayed?).to be(true)
      }

      # YouTube
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
      expect(media_pg.primary_heading.text).to eq("How To Check An Account's Authenticity")
      project_pg = media_pg.go_to_project
      sleep 5
      expect(project_pg.elements('.media__heading').map(&:text).include?("How To Check An Account's Authenticity")).to be(true)

      # Facebook
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
      expect(media_pg.primary_heading.text).to eq('First Draft on Facebook')
      project_pg = media_pg.go_to_project
      sleep 1
      expect(project_pg.elements('.media__heading').map(&:text).include?('First Draft on Facebook')).to be(true)
    end

    it "should login using Slack", bin5: true, quick:true do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h1.source__name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should localize interface based on browser language", bin4: true do
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

    it "should access user confirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it "should access user unconfirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/unconfirmed'
      title = get_element('.main-title')
      expect(title.text == 'Error').to be(true)
    end

    it "should access user already confirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/already-confirmed'
      title = get_element('.main-title')
      expect(title.text == 'Account Already Confirmed').to be(true)
    end

    it "should login using Facebook", bin5: true, quick:true do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      login_pg.login_with_facebook

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load
      displayed_name = me_pg.title
      expected_name = @config['facebook_name']
      expect(displayed_name).to eq(expected_name)
    end

    it "should register and login using e-mail", bin5: true, quick:true do
      login_pg = LoginPage.new(config: @config, driver: @driver).load
      email, password = ['sysops+' + Time.now.to_i.to_s + '@meedan.com', '22345678']
      login_pg.register_and_login_with_email(email: email, password: password)

      me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
      displayed_name = me_pg.title
      expect(displayed_name == 'User With Email').to be(true)
    end

    it "should create a project for a team", bin4: true do
      team = api_create_team
      @driver.navigate.to @config['self_url']
      project_name = "Project #{Time.now}"
      project_pg = TeamPage.new(config: @config, driver: @driver).create_project(name: project_name)

      expect(project_pg.driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
      team_pg = project_pg.click_team_link
      sleep 2
      element = @driver.find_element(:partial_link_text, project_name)
      expect(element.displayed?).to be(true)
    end

    it "should create project media", bin1: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load

      expect(page.contains_string?('This is a test')).to be(false)

      page.create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)

      page.driver.navigate.to @config['self_url']
      page.wait_for_element('.project .media-detail')

      expect(page.contains_string?('This is a test')).to be(true)
    end

    it "should search for image", bin2: true do
      api_create_team_and_project
      sleep 2
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

      sleep 10 # wait for Sidekiq

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      sleep 5
      expect(@driver.find_element(:link_text, 'test.png').nil?).to be(false)
    end

    it "should upload image when registering", bin5: true do
      email, password, avatar = ["test-#{Time.now.to_i}@example.com", '12345678', File.join(File.dirname(__FILE__), 'test.png')]
      page = LoginPage.new(config: @config, driver: @driver).load
             .register_and_login_with_email(email: email, password: password, file: avatar)

      me_page = MePage.new(config: @config, driver: page.driver).load
      avatar = me_page.avatar
      expect(avatar.attribute('src').match(/test\.png/).nil?).to be(false)
    end

    it "should redirect to 404 page", bin4: true do
      @driver.navigate.to @config['self_url'] + '/something-that/does-not-exist'
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should redirect to login screen if not logged in", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/teams'
      title = get_element('.login__heading')
      expect(title.text == 'Sign in').to be(true)
    end

    it "should login using Twitter", bin5: true, quick:true do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = get_element('h1.source__name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should show teams at /check/teams", bin4: true do
      api_create_team
      @driver.navigate.to @config['self_url'] + '/check/teams'
      sleep 2
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should go to source page through user/:id", bin6: true do
      user = api_register_and_login_with_email
      @driver.navigate.to @config['self_url'] + '/check/user/' + user.dbid.to_s
      sleep 1
      title = get_element('.source__name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go back and forward in the history", bin4: true do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.to @config['self_url'] + '/check/tos'
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ /\/tos$/).nil?).to be(false)
    end

    it "should create source and redirect to newly created source", bin6: true do
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

    it "should not create duplicated source", bin6: true do
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

    it "should tag source as a command", bin6: true do
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

    it "should comment source as a command", bin6: true do
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

    it "should not create report as source", bin6: true do
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

    it "should tag source multiple times with commas with command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('Motorhead', 'https://twitter.com/mymotorhead')
      sleep 5
      @driver.find_element(:css, '.source__tab-button-notes').click

      fill_field('#cmd-input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 5

      expect(@driver.page_source.include?('Tagged #foo')).to be(true)
      expect(@driver.page_source.include?('Tagged #bar')).to be(true)
    end

    it "should edit basic source data (name, description/bio, avatar)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      sleep 5
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      input = @driver.find_element(:id, 'source__name-container')
      input.send_keys(" - EDIT ACDC")
      input = @driver.find_element(:id, 'source__bio-container')
      input.send_keys(" - EDIT DESC")
      @driver.find_element(:class, "source__edit-avatar-button").click
      sleep 1
      input = @driver.find_element(:css, 'input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      sleep 1
      @driver.find_element(:class, 'source__edit-save-button').click
      sleep 5
      displayed_name = get_element('h1.source__name').text
      expect(displayed_name.include? "EDIT").to be(true)
    end

    it "should add and remove accounts to sources", bin6: true  do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      sleep 5
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 3
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-link").click
      sleep 1
      fill_field("source__link-input0", "www.acdc.com", :id)
      sleep 2
      @driver.find_element(:class, 'source__edit-save-button').click
      sleep 5
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(true)

      #networks tab
      element = @driver.find_element(:class, "source__tab-button-account")
      sleep 10
      element.click
      sleep 5
      expect(@driver.page_source.include?('The Official AC/DC website and store')).to be(true)

      #delete
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 3
      list = @driver.find_elements(:css => "svg[class='create-task__remove-option-button create-task__md-icon']")
      list[1].click
      sleep 1
      @driver.find_element(:class, 'source__edit-save-button').click
      sleep 5
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(false)
    end

    it "should edit source metadata (contact, phone, location, organization, other)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      sleep 5
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 1
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-phone").click
      str= @driver.page_source
      str = str[str.index('undefined-undefined-Phone-')..str.length]
      str = str[0..(str.index('"')-1)]
      element = @driver.find_element(:id, str)
      fill_field(str, "989898989", :id)

      sleep 1
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-organization").click
      str= @driver.page_source
      str = str[str.index('undefined-undefined-Organization-')..str.length]
      str = str[0..(str.index('"')-1)]
      element = @driver.find_element(:id, str)
      fill_field(str, "ORGANIZATION", :id)

      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-location").click
      str= @driver.page_source
      str = str[str.index('undefined-undefined-Location-')..str.length]
      str = str[0..(str.index('"')-1)]
      fill_field(str, "Location 123", :id)

      sleep 1
      #source__add-other
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-other").click
      sleep 1
      fill_field("source__other-label-input", "label", :id)
      fill_field("source__other-value-input", "value", :id)

      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\n").perform

      sleep 2
      @driver.find_element(:class, 'source__edit-save-button').click
      sleep 5
      expect(@driver.page_source.include?('label: value')).to be(true)
      expect(@driver.page_source.include?('Location 123')).to be(true)
      expect(@driver.page_source.include?('ORGANIZATION')).to be(true)
      expect(@driver.page_source.include?('989898989')).to be(true)
    end

    it "should add and remove source tags", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      sleep 5
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 1
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-tags").click
      sleep 1
      fill_field("sourceTagInput", "TAG1", :id)
      @driver.action.send_keys("\n").perform
      fill_field("sourceTagInput", "TAG2", :id)
      @driver.action.send_keys("\n").perform
      sleep 3
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('TAG1')).to be(true)
      expect(@driver.page_source.include?('TAG2')).to be(true)

      #delete
      sleep 1 until element = @driver.find_element(:class, "source__edit-button")
      element.click
      list = @driver.find_elements(:css => "div.source-tags__tag svg")
      list[0].click
      sleep 1
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('TAG1')).to be(true)
      expect(@driver.page_source.include?('TAG2')).to be(false)
    end

    it "should add and remove source languages",bin6: true  do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      sleep 5
      element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 1
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      @driver.find_element(:class, "source__add-languages").click
      fill_field("sourceLanguageInput", "Acoli", :id)
      @driver.action.send_keys(:down).perform
      @driver.action.send_keys(:return).perform
      sleep 2
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('Acoli')).to be(true)
      sleep 1 until element = @driver.find_element(:class, "source__edit-button")
      element.click
      sleep 1
      list = @driver.find_elements(:css => "div.source-tags__tag svg")
      list[0].click
      sleep 1
      @driver.navigate.refresh
      sleep 3
      expect(@driver.page_source.include?('Acoli')).to be(false)
    end

    it "should not add a duplicated tag from command line", bin3: true do
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

    it "should not create duplicated media", bin1: true do
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

    it "should tag media from tags list", bin3: true do
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

    it "should tag media as a command", bin3: true do
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

    it "should comment media as a command", bin3: true, quick:true do
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

    it "should flag media as a command", bin3: true do
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

    it "should edit project", bin4: true do
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

    it "should redirect to 404 page if id does not exist", bin4: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 3
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(/project\/([0-9]+).*/, 'project/999')
      title = get_element('.main-title')
      expect(title.text == 'Not Found').to be(true)
      expect((@driver.current_url.to_s =~ /\/404$/).nil?).to be(false)
    end

    it "should logout", bin5: true do
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

    it "should navigate between teams", bin4: true, quick: true do
      # setup
      user = api_register_and_login_with_email(email: @user_mail, password: @password)
      team = request_api 'team', { name: 'Team 1', email: user.email, slug: @team1_slug }
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

    #As a different user, request to join one team.
    it "should join team", bin4:true, quick: true do
      api_register_and_login_with_email
      page = TeamsPage.new(config: @config, driver: @driver).load
      page.ask_join_team(subdomain: @team1_slug)
      @wait.until {
        expect(@driver.find_element(:class, "message").nil?).to be(false)
      }
      api_logout
      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+@user_mail)
      #As the group creator, go to the members page and approve the joining request.
      page = TeamsPage.new(config: @config, driver: @driver).load
          .approve_join_team(subdomain: @team1_slug)
      @wait.until {
        elems = @driver.find_elements(:css => ".team-members__list > div")
        expect(elems.size).to be > 1
      }
    end

    it "should update notes count after delete annotation", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      media_pg.fill_input('#cmd-input', 'Test')
      media_pg.element('#cmd-input').submit
      sleep 1
      notes_count = get_element('.media-detail__check-notes-count')
      expect(notes_count.text == '2 notes').to be(true)
      expect(@driver.page_source.include?('Comment deleted')).to be(false)
      media_pg.delete_annotation
      sleep 1
      expect(notes_count.text == '2 notes').to be(true)
      expect(@driver.page_source.include?('Comment deleted')).to be(true)
    end

    it "should auto refresh project when media is created", bin1: true do
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

    it "should auto refresh media when annotation is created", bin3: true do
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

    it "should add image to media comment", bin3: true do
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

    it "should add, edit, answer, update answer and delete short answer task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 3

      # Create a task
      expect(@driver.page_source.include?('Foo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task "Foo or bar?" created by')).to be(false)
      @driver.find_element(:css, '.create-task__add-button').click
      sleep 1
      @driver.find_element(:css, '.create-task__add-short-answer').click
      sleep 1
      fill_field('#task-label-input', 'Foo or bar?')
      @driver.find_element(:css, '.create-task__dialog-submit-button').click
      sleep 2
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task "Foo or bar?" created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('Task "Foo or bar?" answered by')).to be(false)
      fill_field('textarea[name="response"]', 'Foo')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.include?('Task "Foo or bar?" answered by')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Task "Foo or bar?" edited to "Foo or bar???" by')).to be(false)
      @driver.find_element(:css, '.task-actions__icon').click
      sleep 3
      editbutton = @driver.find_element(:css, '.task-actions__edit')
      editbutton.location_once_scrolled_into_view
      editbutton.click
      fill_field('textarea[name="label"]', '??')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "Foo or bar?" edited to "Foo or bar???" by')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Foo or bar???" answered by User With Email: "Foo edited"')).to be(false)
      @driver.find_element(:css, '.task-actions__icon').click
      sleep 2
      @driver.find_element(:css, '.task-actions__edit-response').click

      # Ensure menu closes and textarea is focused...
      @driver.find_element(:css, 'textarea[name="editedresponse"]').click

      fill_field('textarea[name="editedresponse"]', ' edited')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Foo or bar???" answered by User With Email: "Foo edited"')).to be(true)

      # Delete task
      delete_task('Foo')
    end

    # it "should add, edit, answer, update answer and delete single_choice task" do
    #   skip("Needs to be implemented")
    # end

    # it "should add, edit, answer, update answer and delete multiple_choice task" do
    #   skip("Needs to be implemented")
    # end

    it "should search for reverse images", bin2: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'https://www.instagram.com/p/BRYob0dA1SC/'
      sleep 3
      expect(@driver.page_source.include?('This item contains at least one image. Click Search to look for potential duplicates on Google.')).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      @driver.find_element(:css, '.annotation__reverse-image-search').click
      sleep 3
      @driver.switch_to.window(@driver.window_handles.last)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    it "should refresh media", bin1: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
      sleep 2
      title1 = @driver.title
      expect((title1 =~ /Random/).nil?).to be(false)
      @driver.find_element(:css, '.media-actions__icon').click
      @driver.find_element(:css, '.media-actions__refresh').click
      sleep 5
      title2 = @driver.title
      expect((title2 =~ /Random/).nil?).to be(false)
      expect(title1 != title2).to be(true)
    end

    it "should search by project", bin2: true do
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

    it "should search and change sort criteria", bin2: true do
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

    it "should search and change sort order", bin2: true do
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

    it "should search by project through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"projects"%3A%5B0%5D%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(false)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected')
      expect(selected.size == 3).to be(true)
    end

    it "should change search sort criteria through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort"%3A"recent_activity"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Recent activity', 'Newest first', 'Media'].sort).to be(true)
    end

    it "should change search sort order through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort_type"%3A"ASC"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Created', 'Oldest first', 'Media'].sort).to be(true)
    end

    it "should not reset password", bin5: true do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(true)
      expect(@driver.page_source.include?('Password reset sent')).to be(false)
    end

    it "should reset password", bin5: true do
      user = api_create_and_confirm_user
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password(user.email)
      sleep 2
      expect(@driver.page_source.include?('Email not found')).to be(false)
      expect(@driver.page_source.include?('Password reset sent')).to be(true)
    end

    it "should set metatags", bin4: true do
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

    it "should embed", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 2
      request_api('make_team_public', { slug: get_team })

      @driver.navigate.refresh
      sleep 5
      @driver.find_element(:css, '.media-actions__icon').click
      sleep 1
      if @config['app_name'] == 'bridge'
        expect(@driver.page_source.include?('Embed')).to be(false)
        @driver.navigate.to "#{@driver.current_url}/embed"
        sleep 2
        expect(@driver.page_source.include?('Not available')).to be(true)
      elsif @config['app_name'] == 'check'
        expect(@driver.page_source.include?('Embed')).to be(true)
        url = @driver.current_url.to_s
        @driver.find_element(:css, '.media-actions__embed').click
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

    it "should add, edit, answer, update answer and delete geolocation task", bin3: true do
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
      fill_field('textarea[name="response"]', 'Salvador')
      fill_field('textarea[name="coordinates"]', '-12.9015866, -38.560239')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.include?('Task "Where?" answered by')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Task "Where?" edited to "Where was it?" by')).to be(false)
      @driver.find_element(:css, '.task-actions__icon').click
      sleep 2
      @driver.find_element(:css, '.task-actions__edit').click
      update_field('textarea[name="label"]', 'Where was it?')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "Where?" edited to "Where was it?" by')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Where was it?" answered by User With Email: "Vancouver"')).to be(false)
      @driver.find_element(:css, '.task-actions__icon').click
      @driver.find_element(:css, '.task-actions__edit-response').click
      update_field('textarea[name="response"]', 'Vancouver')
      update_field('textarea[name="coordinates"]', '49.2577142, -123.1941156')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Task "Where was it?" answered by User With Email: "Vancouver"')).to be(true)

      # Delete task
      delete_task('Where was it')
    end

    it "should add, edit, answer, update answer and delete datetime task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page

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
      @driver.find_element(:css, '.task-actions__icon').click
      sleep 2
      @driver.find_element(:css, '.task-actions__edit').click
      update_field('textarea[name="label"]', 'When was it?')
      @driver.find_element(:css, '.task__save').click
      sleep 2
      expect(@driver.page_source.include?('Task "When?" edited to "When was it?" by')).to be(true)

      # Edit task response
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(false)
      @driver.find_element(:css, '.task-actions__icon').click
      @driver.find_element(:css, '.task-actions__edit-response').click
      update_field('input[name="hour"]', '12')
      update_field('input[name="minute"]', '34')
      update_field('textarea[name="note"]', '')
      @driver.action.send_keys(:enter).perform
      sleep 2
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(true)

      # Delete task
      delete_task('When was it')
    end

    #Add slack notifications to a team
    it "should add slack notifications to a team", bin2:true, quick: true do
      team = "TestTeam #{Time.now.to_i}"
      api_create_team(team:team)
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + team)
      sleep 5
      @driver.find_element(:class, "team__edit-button").click
      @driver.find_element(:id, "team__settings-slack-notifications-enabled").click
      @driver.find_element(:id, "team__settings-slack-webhook").click
      @driver.find_element(:id, "team__settings-slack-webhook").send_keys "https://hooks.slack.com/services/T02528QUL/BBBBBBBBB/AAAAAAAAAAAAAAAAAAAAAAAA"
      @driver.find_element(:class, "team__save-button").click
      sleep 2
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    end

    it "should paginate project page", bin2: true do
      page = api_create_team_project_claims_sources_and_redirect_to_project_page 21
      page.load
      sleep 5
      @driver.find_element(:xpath, "//span[contains(text(), 'Sources')]").click
      sleep 10
      results = @driver.find_elements(:css, '.medias__item')
      expect(results.size == 40).to be(true)
      results.last.location_once_scrolled_into_view
      sleep 5
      results = @driver.find_elements(:css, '.medias__item')
      expect(results.size == 42).to be(true)
    end
  end
end
