require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/page.rb'
require_relative './api_helpers.rb'
require_relative './smoke_spec.rb'

CONFIG = YAML.load_file('config.yml')
require_relative "#{CONFIG['app_name']}_spec.rb"

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
    @webdriver_url = webdriver_url
    @browser_capabilities = browser_capabilities


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
      print " [Test \"#{example.description}\" failed! Check screenshot at #{link} and browser console output: #{console_logs}] "
    end
    @driver.quit
  end

  # The tests themselves start here
  context "web" do

    include_examples "custom"
    include_examples "smoke"

    it "should manage team members roles", bin4: true do
      # setup
      @user_mail = "test" +Time.now.to_i.to_s+rand(9999).to_s + @user_mail
      @team1_slug = 'team1'+Time.now.to_i.to_s+rand(9999).to_s
      user = api_register_and_login_with_email(email: @user_mail, password: @password)
      team = request_api 'team', { name: 'Team 1', email: user.email, slug: @team1_slug }

      #As a different user, request to join one team and be accepted.
      user = api_register_and_login_with_email(email: "new"+@user_mail, password: @password)
      page = MePage.new(config: @config, driver: @driver).load
      page.ask_join_team(subdomain: @team1_slug)
      @wait.until {
        expect(@driver.find_element(:class, "message").nil?).to be(false)
      }
      api_logout
      @driver.quit

      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+@user_mail)

      #As the group creator, go to the members page and approve the joining request.
      page = MePage.new(config: @config, driver: @driver).load
      page.go(@config['self_url'] + '/check/me')
      page.approve_join_team(subdomain: @team1_slug)
      count = 0
      elems = @driver.find_elements(:css => ".team-members__list > div > div > div > div")
      while elems.size <= 1 && count < 15
        sleep 5
        count += 1
        elems = @driver.find_elements(:css => ".team-members__list > div > div > div > div")
      end
      expect(elems.size).to be > 1

      #edit team member role
      wait_for_selector('.team-members__edit-button', :css).click
      wait_for_selector('.role-select', :css, 29, 1).click

      wait_for_selector('li.role-journalist').click
      wait_for_selector('#confirm-dialog__checkbox').click
      wait_for_selector('#confirm-dialog__confirm-action-button').click
      wait_for_selector('.team-members__edit-button', :css).click

      el = wait_for_selector('input[name="role-select"]', :css, 29, 1)
      expect(el.value).to eq 'journalist'
    end

    it "should manage team tags", bin6: true do
      # Create team and go to team page that should not contain any tag
      team = "tag-team-#{Time.now.to_i}"
      api_create_team(team: team)
      p = Page.new(config: @config, driver: @driver)
      @driver.navigate.to @config['self_url'] + '/' + team
      wait_for_selector('.team-menu__team-settings-button').click
      wait_for_selector('.team-settings__tasks-tab')
      wait_for_selector('.team-settings__tags-tab').click
      wait_for_selector_none("team-tasks")
      expect(@driver.page_source.include?('No team tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetag')).to be(false)

      # Create tag
      fill_field('#tag__new', 'newteamwidetag')
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#tag__text-newteamwidetag")
      expect(@driver.page_source.include?('No team tags')).to be(false)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(false)

      # Edit tag
      wait_for_selector('#tag__text-newteamwidetag button').click
      wait_for_selector(".tag__delete")
      wait_for_selector('.tag__edit').click
      wait_for_selector("#tag__edit")
      fill_field('#tag__edit', 'edited')
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#tag__text-newteamwidetagedited")
      expect(@driver.page_source.include?('No team tags')).to be(false)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(true)

      # Delete tag
      wait_for_selector('#tag__text-newteamwidetagedited button').click
      wait_for_selector('.tag__edit')
      wait_for_selector('.tag__delete').click
      wait_for_selector('#tag__confirm').click
      wait_for_selector('#tag__confirm-delete').click
      wait_for_selector_none('#tag__confirm')
      wait_for_selector_none("#tag__text-newteamwidetagedited")
      expect(@driver.page_source.include?('No team tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(false)
    end


    it "should filter by medias or sources", bin6: true do
      api_create_team_project_and_link 'https://twitter.com/TheWho/status/890135323216367616'
      @driver.navigate.to @config['self_url']
      wait_for_selector("card-with-border", :class)
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(false)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath).click
      wait_for_selector("search-query__submit-button", :id).click
      wait_for_selector("source-card", :class)
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(false)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//span[contains(text(), 'Links')]", :xpath).click
      wait_for_selector("search-query__submit-button", :id).click
      wait_for_selector("media__heading", :class)
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(false)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
    end

    it "should redirect to access denied page", bin1: true do
      user = api_register_and_login_with_email
      api_logout
      api_register_and_login_with_email
      me_pg = MePage.new(config: @config, driver: @driver).load
      wait_for_selector("#teams-tab").click;
      wait_for_selector("//span[contains(text(), 'Create Team')]", :xpath)
      expect(@driver.page_source.include?('Access Denied')).to be(false)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(true)
      unauthorized_pg = SourcePage.new(id: user.dbid, config: @config, driver: @driver).load
      wait_for_selector(".main-title")
      expect(@driver.page_source.include?('Access Denied')).to be(true)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
    end

    it "should edit the description of a media", bin4: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      wait_for_selector('.media-detail')
      media_pg.toggle_card # Make sure the card is closed
      expect(media_pg.contains_string?('Edited media description')).to be(false)
      media_pg.toggle_card # Expand the card so the edit button is accessible
      wait_for_selector('.media-actions')
      media_pg.set_description('Edited media description')
      expect(media_pg.contains_string?('Edited media description')).to be(true)
    end

    it "should edit the title of a media", bin1: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      wait_for_selector('.media-detail')
      media_pg.toggle_card # Make sure the card is closed
      expect(media_pg.primary_heading.text).to eq('https://t.co/i17DJNqiWX')
      media_pg.toggle_card # Expand the card so the edit button is accessible
      wait_for_selector('.media-actions')
      media_pg.set_title('Edited media title')
      expect(@driver.page_source.include?('Edited media title')).to be(true)
      wait_for_selector(".project-header__back-button").click
      wait_for_selector('.media__heading')
      expect(@driver.page_source.include?('Edited media title')).to be(true)
    end

    it "should display a default title for new media", bin1: true, quick:true do
      # Tweets
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/firstdraftnews/status/835587295394869249')
      media_pg.toggle_card # Collapse card to show the title
      wait_for_selector('.media__heading')
      expect(media_pg.primary_heading.text.include?('In a chat about getting')).to be(true)
      project_pg = media_pg.go_to_project
      wait_for_selector('.media__heading')
      @wait.until {
        element = @driver.find_element(:partial_link_text, 'In a chat about getting')
        expect(element.displayed?).to be(true)
      }

      # YouTube
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
      media_pg.toggle_card # Collapse card to show the title
      wait_for_selector('.media__heading')
      expect(media_pg.primary_heading.text).to eq("How To Check An Account's Authenticity")
      project_pg = media_pg.go_to_project
      wait_for_selector('.media__heading')
      expect(project_pg.elements('.media__heading').map(&:text).include?("How To Check An Account's Authenticity")).to be(true)

      # Facebook
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
      media_pg.toggle_card # Collapse card to show the title
      wait_for_selector('.media__heading')
      expect(media_pg.primary_heading.text.include?('Facebook')).to be(true)
      project_pg = media_pg.go_to_project
      wait_for_selector('.media__heading')
      expect(project_pg.elements('.media__heading').map(&:text).select{ |x| x =~ /Facebook/ }.empty?).to be(false)
    end

      it "should localize interface based on browser language", bin6: true do
      unless browser_capabilities['appiumVersion']
        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'fr' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        @wait.until { driver.find_element(:id, "register-or-login") }
        expect(driver.find_element(:css, '.login__heading span').text == 'Connexion').to be(true)
        driver.quit

        caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'pt' } })
        driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
        driver.navigate.to @config['self_url']
        @wait.until { driver.find_element(:id, "register-or-login") }
        expect(driver.find_element(:css, '.login__heading span').text == 'Entrar').to be(true)
        driver.quit
      end
    end

    it "should access user confirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/confirmed'
      title = wait_for_selector('.main-title')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it "should access user unconfirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/unconfirmed'
      title = wait_for_selector('.main-title')
      expect(title.text == 'Error').to be(true)
    end

    it "should access user already confirmed page", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/user/already-confirmed'
      title = wait_for_selector('.main-title')
      expect(title.text == 'Account Already Confirmed').to be(true)
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

    it "should search for image",  bin2: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))
      wait_for_selector("add-annotation__buttons", :class)
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      wait_for_selector("search__results-heading", :class)
      expect(@driver.find_element(:link_text, 'test.png').nil?).to be(false)
    end

    it "should redirect to 404 page", bin4: true do
      @driver.navigate.to @config['self_url'] + '/something-that/does-not-exist'
      title = wait_for_selector('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should redirect to login screen if not logged in", bin5: true do
      @driver.navigate.to @config['self_url'] + '/check/teams'
      title = wait_for_selector('.login__heading')
      expect(title.text == 'Sign in').to be(true)
    end

    it "should go to source page through user/:id", bin6: true do
      user = api_register_and_login_with_email
      @driver.navigate.to @config['self_url'] + '/check/user/' + user.dbid.to_s
      title = wait_for_selector('.source__name')
      expect(title.text == 'User With Email').to be(true)
    end

    it "should go back and forward in the history", bin4: true do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.to @config['self_url'] + '/check/terms-of-service'
      expect((@driver.current_url.to_s =~ /\/terms-of-service$/).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ /\/$/).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ /\/terms-of-service$/).nil?).to be(false)
    end

    it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
      page = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector("add-annotation__insert-photo",:class)
      new_tag = Time.now.to_i.to_s
      # Validate assumption that tag does not exist
      expect(page.has_tag?(new_tag)).to be(false)
      # Add tag
      page.add_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(true)
      # Try to add duplicate
      page.add_tag(new_tag)
      @wait.until { @driver.page_source.include?('Validation') }
      expect(page.contains_string?('Tag already exists')).to be(true)
      # Verify that tag is not added and that error message is displayed
      expect(page.tags.count(new_tag)).to be(1)
      page.delete_tag(new_tag)
      expect(page.has_tag?(new_tag)).to be(false)
    end

    it "should tag source as a command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      wait_for_selector('.source__tab-button-account')
      expect(@driver.page_source.include?('command')).to be(false)
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      wait_for_selector('.add-annotation__insert-photo')
      expect(@driver.page_source.include?('Tagged #command')).to be(false)
      input = wait_for_selector('#cmd-input')
      input.send_keys('/tag command')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.annotation__author-name')
      wait_for_size_change(0,'.annotations__list-item')
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
      @driver.navigate.refresh
      wait_for_selector('.source__tab-button-account')
      expect(@driver.page_source.include?('command')).to be(true)
    end

    it "should comment source as a command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('The Beatles', 'https://twitter.com/thebeatles')
      wait_for_selector('.source__tab-button-account')
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      expect(@driver.page_source.include?('This is my comment')).to be(false)
      input = wait_for_selector('#cmd-input')
      input.send_keys('/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.annotation__avatar-col')
      wait_for_size_change(0,'annotations__list-item')
      expect(@driver.page_source.include?('This is my comment')).to be(true)
      @driver.navigate.refresh
      wait_for_selector('.source__tab-button-account')
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      wait_for_selector('.annotation__card-content')
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should not create report as source", bin6: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      wait_for_selector("#search__open-dialog-button")
      wait_for_selector("#create-media__add-item").click
      wait_for_selector(".create-media__form")
      el = @driver.find_element(:id,'create-media__source')
      el.click
      wait_for_selector("#create-media-source-name-input")
      fill_field('#create-media-source-url-input', 'https://twitter.com/IronMaiden/status/832726327459446784')
      wait_for_selector('#create-media-dialog__submit-button').click
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
      message = wait_for_selector('.message').text
      expect(message.match(/Sorry, this is not a profile/).nil?).to be(false)
    end

    it "should edit basic source data (name, description/bio, avatar)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      el = wait_for_selector(".source-menu__edit-source-button")
      el.click
      input = wait_for_selector('#source__name-container')
      input.send_keys(" - EDIT ACDC")
      input = wait_for_selector('#source__bio-container')
      input.send_keys(" - EDIT DESC")
      el = wait_for_selector(".source__edit-avatar-button")
      el.click
      wait_for_selector(".without-file")
      input = wait_for_selector('input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      wait_for_selector(".with-file")
      @driver.find_element(:class, 'source__edit-save-button').click
      wait_for_selector(".source__tab-button-notes")
      displayed_name = wait_for_selector('h1.source__name').text
      expect(displayed_name.include? "EDIT").to be(true)
    end

    it "should add and remove accounts to sources", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      wait_for_selector(".source__tab-button-account")
      element = wait_for_selector(".source-menu__edit-source-button")
      element.click
      element = wait_for_selector(".source__edit-addinfo-button")
      element.click
      element = wait_for_selector(".source__add-link")
      element.click
      wait_for_selector("#source__link-input0")
      fill_field("#source__link-input0", "www.acdc.com")
      element = wait_for_selector( '.source__edit-save-button')
      element.click
      wait_for_selector('.media-tags')
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(true)

      #networks tab
      element = @driver.find_element(:class, "source__tab-button-account")
      element.click
      wait_for_selector('.source-card')
      expect(@driver.page_source.include?('The Official AC/DC website and store')).to be(true)

      #delete
      element = wait_for_selector(".source-menu__edit-source-button")
      element.click
      wait_for_selector(".source__bio-input")
      list = wait_for_selector_list("svg[class='create-task__remove-option-button create-task__md-icon']")
      element = wait_for_selector_list('.source__remove-link-button')[1]
      element.click
      element = wait_for_selector('.source__edit-save-button')
      element.click
      wait_for_selector('.media-tags')
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(false)
    end

    it "should edit source metadata (contact, phone, location, organization, other)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      wait_for_selector('.source__tab-button-account')
      expect(@driver.page_source.include?('label: value')).to be(false)
      expect(@driver.page_source.include?('Location 123')).to be(false)
      expect(@driver.page_source.include?('ORGANIZATION')).to be(false)
      expect(@driver.page_source.include?('989898989')).to be(false)
      el = wait_for_selector('.source-menu__edit-source-button')
      el.click
      el = wait_for_selector('.source__edit-addinfo-button')
      el.click
      el = wait_for_selector('.source__add-phone')
      el.click
      wait_for_selector(".source__metadata-phone-input")
      fill_field('.source__metadata-phone-input input[type="text"]', '989898989')
      el = wait_for_selector('.source__edit-addinfo-button')
      el.click
      el = wait_for_selector(".source__add-organization")
      el.click
      wait_for_selector(".source__metadata-organization-input")
      fill_field('.source__metadata-organization-input input[type="text"]', 'ORGANIZATION')
      el = wait_for_selector(".source__edit-addinfo-button")
      el.click
      el = wait_for_selector(".source__add-location")
      el.click
      wait_for_selector(".source__metadata-location-input")
      fill_field('.source__metadata-location-input input[type="text"]', 'Location 123')
      #source__add-other
      el = wait_for_selector(".source__edit-addinfo-button")
      el.click
      el = wait_for_selector(".source__add-other")
      el.click
      wait_for_selector("#source__other-label-input")
      fill_field("#source__other-label-input", "label")
      fill_field("#source__other-value-input", "value")
      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\n").perform
      el = wait_for_selector(".source__edit-save-button")
      el.click
      wait_for_selector('.source-menu__edit-source-button')
      expect(@driver.page_source.include?('label: value')).to be(true)
      expect(@driver.page_source.include?('Location 123')).to be(true)
      expect(@driver.page_source.include?('ORGANIZATION')).to be(true)
      expect(@driver.page_source.include?('989898989')).to be(true)

      # Now try to edit
      wait_for_selector('.source-menu__edit-source-button').click
      wait_for_selector("#source__name-container")
      fill_field('.source__metadata-phone-input input[type="text"]', '121212121')
      wait_for_selector('.source__edit-save-button').click
      wait_for_selector('.source-menu__edit-source-button')
      expect(@driver.page_source.include?('121212121')).to be(true)
    end



    it "should add and remove source languages", bin6: true  do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      wait_for_selector(".source__tab-button-account")
      element = wait_for_selector(".source-menu__edit-source-button")
      element.click
      wait_for_selector(".source__edit-buttons-cancel-save")
      element = wait_for_selector(".source__edit-addinfo-button")
      element.click
      element = wait_for_selector(".source__add-languages")
      element.click
      wait_for_selector("#sourceLanguageInput")
      fill_field("#sourceLanguageInput", "Acoli")
      element = wait_for_selector('div[role="menu"] > div > span[role="menuitem"]');
      element.click
      element = wait_for_selector(".source__edit-save-button")
      element.click
      wait_for_selector(".source-tags__tag")
      expect(@driver.page_source.include?('Acoli')).to be(true)
      element = wait_for_selector(".source-menu__edit-source-button")
      element.click
      elements = wait_for_selector_list("div.source-tags__tag svg")
      elements[0].click
      element = wait_for_selector(".source__edit-save-button")
      element.click
      wait_for_selector(".source__tab-button-media")
      expect(@driver.page_source.include?('Acoli')).to be(false)
    end

    it "should not add a duplicated tag from command line", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      new_tag = Time.now.to_i.to_s
      old = @driver.find_elements(:class,"annotations__list-item").length

      # Validate assumption that tag does not exist
      expect(media_pg.has_tag?(new_tag)).to be(false)

      # Try to add from command line
      media_pg.add_annotation("/tag #{new_tag}")
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(media_pg.has_tag?(new_tag)).to be(true)

      # Try to add duplicate from command line
      media_pg.add_annotation("/tag #{new_tag}")

      # Verify that tag is not added and that error message is displayed
      expect(media_pg.tags.count(new_tag)).to be(1)
      @wait.until { @driver.page_source.include?('Tag already exists') }
      expect(@driver.page_source.include?('Tag already exists')).to be(true)
    end

    it "should not create duplicated media", bin4: true do
      api_create_team_project_and_link_and_redirect_to_media_page @media_url
      id1 = @driver.current_url.to_s.gsub(/^.*\/media\//, '').to_i
      expect(id1 > 0).to be(true)
      @driver.navigate.to @driver.current_url.to_s.gsub(/\/media\/[0-9]+$/, '')
      wait_for_selector(".medias__item")
      wait_for_selector("#create-media__add-item").click
      wait_for_selector("#create-media__link")
      fill_field('#create-media-input', @media_url)
      wait_for_selector('#create-media-dialog__submit-button').click
      wait_for_selector(".add-annotation__insert-photo")
      id2 = @driver.current_url.to_s.gsub(/^.*\/media\//, '').to_i
      expect(id1 == id2).to be(true)
    end

    it "should tag media as a command", bin4: true do
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

    it "should flag media as a command", bin4: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page

      expect(@driver.page_source.include?('Flag')).to be(false)

      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit

      wait_for_selector('.annotation__default')
      expect(@driver.page_source.include?('Flag')).to be(true)
      @driver.navigate.refresh
      wait_for_selector('.annotations')
      expect(@driver.page_source.include?('Flag')).to be(true)
    end

    it "should redirect to 404 page if id does not exist", bin4: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      wait_for_selector('#create-media__add-item')
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(/project\/([0-9]+).*/, 'project/999')
      title = wait_for_selector('.main-title')
      expect(title.text == 'Not Found').to be(true)
      expect((@driver.current_url.to_s =~ /\/not-found$/).nil?).to be(false)
    end

    it "should logout", bin5: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      page = ProjectPage.new(config: @config, driver: @driver).logout

      expect(page.contains_string?('Sign in')).to be(true)
    end

    it "should show: edit project (link only to users with update project permission)", bin3: true do
      utp = api_create_team_project_and_two_users
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+utp[:user1]["email"])
      page.go(@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
      wait_for_selector(".search")
      l = wait_for_selector_list('.project-actions')
      expect(l.length == 1).to be(true)

      page.go(@config['api_path'] + '/test/session?email='+utp[:user2]["email"])
      page.go(@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
      wait_for_selector(".search")
      l = wait_for_selector_list('.project-actions')
      expect(l.length == 0).to be(true)
    end

    it "should request to join, navigate between teams, accept, reject and delete member", bin5: true, quick: true do
      # setup
      @user_mail = "test" +Time.now.to_i.to_s+rand(9999).to_s + @user_mail
      @team1_slug = 'team1'+Time.now.to_i.to_s+rand(9999).to_s
      user = api_register_and_login_with_email(email: @user_mail, password: @password)
      team = request_api 'team', { name: 'Team 1', email: user.email, slug: @team1_slug }
      request_api 'project', { title: 'Team 1 Project', team_id: team.dbid }
      team = request_api 'team', { name: 'Team 2', email: user.email, slug: "team-2-#{rand(9999)}#{Time.now.to_i}" }
      request_api 'project', { title: 'Team 2 Project', team_id: team.dbid }

      page = MePage.new(config: @config, driver: @driver).load.select_team(name: 'Team 1')

      expect(page.team_name).to eq('Team 1')
      expect(page.project_titles.include?('Team 1 Project')).to be(true)
      expect(page.project_titles.include?('Team 2 Project')).to be(false)

      page = MePage.new(config: @config, driver: @driver).load.select_team(name: 'Team 2')

      expect(page.team_name).to eq('Team 2')
      expect(page.project_titles.include?('Team 2 Project')).to be(true)
      expect(page.project_titles.include?('Team 1 Project')).to be(false)

      #As a different user, request to join one team and be accepted.
      user = api_register_and_login_with_email(email: "new"+@user_mail, password: @password)
      page = MePage.new(config: @config, driver: @driver).load
      page.ask_join_team(subdomain: @team1_slug)
      @wait.until {
        expect(@driver.find_element(:class, "message").nil?).to be(false)
      }
      api_logout
      @driver.quit

      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+@user_mail)

      #As the group creator, go to the members page and approve the joining request.
      page = MePage.new(config: @config, driver: @driver).load
      page.go(@config['self_url'] + '/check/me')
      page.approve_join_team(subdomain: @team1_slug)
      count = 0
      elems = @driver.find_elements(:css => ".team-members__list > div > div > div > div")
      while elems.size <= 1 && count < 15
        sleep 5
        count += 1
        elems = @driver.find_elements(:css => ".team-members__list > div > div > div > div")
      end
      expect(elems.size).to be > 1

      # "should redirect to team page if user asking to join a team is already a member"
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email=new'+@user_mail)
      #page = MePage.new(config: @config, driver: @driver).load
      @driver.navigate.to @config['self_url'] + "/"+@team1_slug+"/join"

      wait_for_selector('.team__primary-info')
      @wait.until {
        expect(@driver.current_url.eql? @config['self_url']+"/"+@team1_slug ).to be(true)
      }

      # "should reject member to join team"
      user = api_register_and_login_with_email
      page = MePage.new(config: @config, driver: @driver).load
      page.ask_join_team(subdomain: @team1_slug)
      @wait.until {
        expect(@driver.find_element(:class, "message").nil?).to be(false)
      }
      api_logout
      @driver.quit

      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+@user_mail)
      page = MePage.new(config: @config, driver: @driver).load
          .disapprove_join_team(subdomain: @team1_slug)
      count = 0
      while @driver.page_source.include?('Requests to join') && count < 15
        sleep 5
        count += 1
      end
      expect(@driver.page_source.include?('Requests to join')).to be(false)

      # "should delete member from team"
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+@user_mail)
      page = MePage.new(config: @config, driver: @driver).load
      @driver.navigate.to @config['self_url'] + '/'+@team1_slug
      wait_for_selector('.team-members__member')
      wait_for_selector('.team-members__edit-button').click

      l = wait_for_selector_list_size('team-members__delete-member', 2, :class)
      old = l.length
      expect(l.length > 1).to be(true)
      l.last.click
      wait_for_selector('#confirm-dialog__checkbox').click
      wait_for_selector('#confirm-dialog__confirm-action-button').click
      wait_for_selector_none('#confirm-dialog__checkbox')
      new = wait_for_size_change(old, 'team-members__delete-member', :class)
      expect(new < old).to be(true)
    end

    it "should autorefresh project when media is created", bin1: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      url = @driver.current_url
      wait_for_selector('#search__open-dialog-button')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      wait_for_selector(".search")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector('.avatar')
      wait_for_selector("#create-media__add-item").click
      wait_for_selector("#create-media-input").click
      fill_field('#create-media-input', 'Auto-Refresh')
      wait_for_selector('#create-media-dialog__submit-button').click
      wait_for_selector('.medias__item')
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)
      wait_for_selector("#create-media__add-item")
      el = wait_for_selector('.medias__item')
      el.location_once_scrolled_into_view
      result = @driver.find_elements(:css, '.medias__item')
      wait_for_size_change(0, '.medias__item')
      expect(result.size == 1).to be(true)
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    it "should autorefresh media when annotation is created", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      url = @driver.current_url
      wait_for_selector('#cmd-input')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector("#create-media__add-item")
      fill_field('#cmd-input', 'Auto-Refresh')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.create-task__add-button')
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)
      wait_for_selector('.annotation__card-activity-create-comment')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    it "should embed", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector(".tasks")
      request_api('make_team_public', { slug: get_team })

      @driver.navigate.refresh
      wait_for_selector('.media-detail')
      wait_for_selector('.media-actions__icon').click
      wait_for_selector('.media-actions__edit')
      expect(@driver.page_source.include?('Embed')).to be(true)
      url = @driver.current_url.to_s
      wait_for_selector('.media-actions__embed').click
      wait_for_selector("#media-embed__actions")
      expect(@driver.current_url.to_s == "#{url}/embed").to be(true)
      expect(@driver.page_source.include?('Not available')).to be(false)
      @driver.find_elements(:css, 'body').map(&:click)
      el = wait_for_selector('#media-embed__actions-copy')
      el.click
      wait_for_selector("#media-embed__copy-code")
      @driver.navigate.to 'https://paste.ubuntu.com/'
      el = wait_for_selector('#id_content')
      el.send_keys(' ')
      @driver.action.send_keys(:control, 'v').perform
      wait_for_text_change(' ',"#id_content", :css)
      expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
    end

    it "should give 404 when trying to access a media that is not related to the project on the URL", bin1: true do
      t1 = api_create_team_and_project()
      data = api_create_team_project_and_link 'https://twitter.com/TheWho/status/890135323216367616'
      url = data.full_url
      url = url[0..data.full_url.index("project")+7]+t1[:project].dbid.to_s + url[url.index("/media")..url.length-1]
      @driver.navigate.to url
      wait_for_selector("main-title",:class)
      title = wait_for_selector('.main-title')
      expect(title.text == 'Not Found').to be(true)
    end

    it "should cancel request through switch teams", bin1: true do
      user = api_register_and_login_with_email
      t1 = api_create_team(user: user)
      t2 = api_create_team(user: user)
      page = MePage.new(config: @config, driver: @driver).load
          .select_team(name: t1.name)
      wait_for_selector("team-menu__edit-team-button",:class)
      expect(page.team_name).to eq(t1.name)
      page = MePage.new(config: @config, driver: @driver).load
          .select_team(name: t2.name)
      wait_for_selector("team-menu__edit-team-button",:class)
      expect(page.team_name).to eq(t2.name)
    end

    it "should linkify URLs on comments", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(false)
      old = wait_for_selector_list('annotation__card-content', :class, 25, 'linkify URLs on comments 1').length
      fill_field('textarea[name="cmd"]', 'https://meedan.com/en/')
      el = wait_for_selector(".add-annotation button[type=submit]")
      el.click
      wait_for_selector('.annotation__avatar-col')
      old = wait_for_size_change(old, 'annotation__card-content', :class, 25, 'linkify URLs on comments 2')
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(true)
      el = wait_for_selector_list("//a[contains(text(), 'https://meedan.com/en/')]", :xpath)
      expect(el.length == 1).to be(true)
    end

    it "should find all medias with an empty search", bin1: true do
      api_create_media_and_go_to_search_page
      old = wait_for_selector_list(".medias__item").length
      wait_for_selector("#search__open-dialog-button").click
      el = wait_for_selector("#search-input")
      el.click
      @driver.action.send_keys(:enter).perform
      wait_for_selector_none("#search-input")
      current = wait_for_selector_list(".medias__item").length
      expect(old == current).to be(true)
      expect(current > 0).to be(true)
    end

    it "should search in trash page", bin4: true do
      api_create_claim_and_go_to_search_page
      wait_for_selector(".media-detail__card-header")
      wait_for_selector(".media__heading > a").click
      wait_for_selector('.media-actions__icon').click
      wait_for_selector(".media-actions__move")
      wait_for_selector(".media-actions__send-to-trash").click
      wait_for_selector(".message")
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/trash'
      wait_for_selector(".media-detail__card-header")
      trash_button = wait_for_selector('.trash__empty-trash-button')
      expect(trash_button.nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//div[contains(text(), 'In Progress')]",:xpath).click
      wait_for_selector("search-query__submit-button", :id).click
      wait_for_selector_none("#search-query__submit-button")
      expect(@driver.page_source.include?('My search result')).to be(false)
    end

    it "should find medias when searching by keyword", bin2: true do
      data = api_create_team_and_project
      api_create_media(data: data, url: "https://www.facebook.com/permalink.php?story_fbid=10155901893214439&id=54421674438")
      media = api_create_media(data: data, url: "https://twitter.com/TwitterVideo/status/931930009450795009")
      @driver.navigate.to @config['self_url'] + '/' + data[:team].slug + '/search'
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".search__results")
      wait_for_selector("//span[contains(text(), '1 - 2 / 2')]",:xpath)
      old = wait_for_selector_list("medias__item", :class).length
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
      expect(@driver.page_source.include?('on Facebook')).to be(true)
      el = wait_for_selector("#search-input")
      el.click
      el.send_keys "video"
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-input")
      wait_for_selector("//span[contains(text(), '1 / 1')]",:xpath)
      current = wait_for_selector_list(".medias__item").length
      expect(old > current).to be(true)
      expect(current > 0).to be(true)
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
      expect(@driver.page_source.include?('on Facebook')).to be(false)
      wait_for_selector("#search__open-dialog-button").click
      el = wait_for_selector("#search-input")
      el.clear
      el.click
      el.send_keys "meedan"
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-input")
      wait_for_selector("//span[contains(text(), '1 / 1')]",:xpath)
      current = wait_for_selector_list(".medias__item").length
      expect(old > current).to be(true)
      expect(current > 0).to be(true)
      expect(@driver.page_source.include?('on Facebook')).to be(true)
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(false)
    end

    it "should add, edit, answer, update answer and delete short answer task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      expect(@driver.page_source.include?('Foo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task created by User With Email: Foo or bar?')).to be(false)

      el = wait_for_selector('.create-task__add-button')
      el.click
      el = wait_for_selector('.create-task__add-short-answer')
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input')
      fill_field('#task-label-input', 'Foo or bar?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      wait_for_selector('.annotation__task-created')
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
      fill_field('textarea[name="response"]', 'Foo')
      @driver.find_element(:css, '.task__save').click
      wait_for_selector('.annotation__task-resolved')
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Foo or bar???')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      editbutton = wait_for_selector('.task-actions__edit')
      editbutton.location_once_scrolled_into_view
      editbutton.click
      wait_for_selector("#task-description-input")
      fill_field('#task-label-input', '??')
      editbutton = wait_for_selector('.create-task__dialog-submit-button')
      editbutton.click
      wait_for_selector('.annotation__update-task')
      expect(@driver.page_source.include?('Foo or bar???')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(false)
      el = wait_for_selector('.task-actions__icon').click

      el = wait_for_selector('.task-actions__edit-response')
      el.click

      # Ensure menu closes and textarea is focused...
      el = wait_for_selector('textarea[name="response"]', :css)
      el.click
      wait_for_selector(".task__cancel")
      fill_field('textarea[name="response"]', ' edited')
      @driver.find_element(:css, '.task__save').click
      wait_for_selector_none(".task__cancel")
      media_pg.wait_all_elements(9, 'annotations__list-item', :class)
      wait_for_selector('.annotation--task_response_free_text')
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(true)

      # Delete task
      delete_task('Foo')
    end

    it "should add, edit, answer, update answer and delete single_choice task", bin2: true  do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')
      # Create a task
      expect(@driver.page_source.include?('Foo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      el = wait_for_selector('.create-task__add-choose-one')
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input')
      fill_field('#task-label-input', 'Foo or bar?')
      fill_field('0', 'Foo', :id)
      fill_field('1', 'Bar', :id)
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      wait_for_selector('.annotation__task-created')
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)
      # Answer task
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
      el = wait_for_selector('0', :id)
      el.click
      el = wait_for_selector('.task__submit')
      el.click
      wait_for_selector('.annotation__task-resolved')
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)
      # Edit task
      expect(@driver.page_source.include?('Task edited by')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      editbutton = wait_for_selector('.task-actions__edit')
      editbutton.location_once_scrolled_into_view
      editbutton.click
      fill_field('#task-label-input', '??')
      editbutton = wait_for_selector('.create-task__dialog-submit-button')
      editbutton.click
      wait_for_selector('.annotation__update-task')
      expect(@driver.page_source.include?('Task edited by')).to be(true)
      # Edit task answer

      el = wait_for_selector('.task-actions__icon').click
      el = wait_for_selector('.task-actions__edit-response')
      el.click
      el = wait_for_selector('1', :id)
      el.click
      el = wait_for_selector('task__submit', :class)
      el.click
      wait_for_selector('.annotation--task_response_single_choice')
      # Delete task
      delete_task('Foo')
    end

    it "should add, edit, answer, update answer and delete multiple_choice task", bin5: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')
      # Create a task
      expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      el = wait_for_selector('create-task__add-choose-multiple', :class)
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input')
      fill_field('#task-label-input', 'Foo, Doo or bar?')
      fill_field('0', 'Foo', :id)
      fill_field('1', 'Bar', :id)
      el = wait_for_selector("//span[contains(text(), 'Add Option')]",:xpath)
      el.click
      fill_field('2', 'Doo', :id)
      el = wait_for_selector("//span[contains(text(), 'Add \"Other\"')]",:xpath)
      el.click
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      wait_for_selector('.annotation__task-created')
      expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)
      # Answer task
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
      el = wait_for_selector('#Foo')
      el.click
      el = wait_for_selector('#Doo')
      el.click
      el = wait_for_selector('.task__submit')
      el.click
      wait_for_selector('.annotation__task-resolved')
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)
      # Edit task
      expect(@driver.page_source.include?('Task edited by')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      editbutton = wait_for_selector('.task-actions__edit')
      editbutton.location_once_scrolled_into_view
      editbutton.click
      wait_for_selector('#task-label-input')
      fill_field('#task-label-input', '??')
      editbutton = wait_for_selector('.create-task__dialog-submit-button')
      editbutton.click
      wait_for_selector('.annotation__update-task')
      expect(@driver.page_source.include?('Task edited by')).to be(true)
      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(false)
      el = wait_for_selector('.task-actions__icon').click
      el = wait_for_selector('.task-actions__edit-response')
      el.click
      el = wait_for_selector('#Doo')
      el.click
      el = wait_for_selector('.task__option_other_text_input')
      el.click
      fill_field('textarea[name="response"]', 'BooYaTribe')
      el = wait_for_selector('.task__submit')
      el.click
      wait_for_selector('.annotation--task_response_multiple_choice')
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(true)
      # Delete task
      delete_task('Foo')
    end

    it "should search for reverse images", bin2: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'https://www.instagram.com/p/BRYob0dA1SC/'
      card = wait_for_selector_list(".media-detail__card-header").length
      expect(card == 1).to be(true)
      wait_for_selector('.annotation__reverse-image')
      expect(@driver.page_source.include?('This item contains at least one image. Click Search to look for potential duplicates on Google.')).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      @driver.find_element(:css, '.annotation__reverse-image-search').click
      wait_for_selector_none(".create-task__add-button")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector(".create-task__add-button")
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    it "should refresh media", bin1: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
      wait_for_selector(".media-detail__card-header")
      title1 = @driver.title
      expect((title1 =~ /Random/).nil?).to be(false)
      el = wait_for_selector('.media-actions__icon')
      el.click
      wait_for_selector(".media-actions__edit")
      @driver.find_element(:css, '.media-actions__refresh').click
      wait_for_selector_none(".media-actions__edit")
      wait_for_text_change(title1,"title", :css, 30)
      title2 = @driver.title
      expect((title2 =~ /Random/).nil?).to be(false)
      expect(title1 != title2).to be(true)
    end

    it "should search by project", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(true)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".search-filter__project-chip").click
      wait_for_selector(".search-filter__project-chip--selected")
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      text = wait_for_selector("title", :css).text
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(false)
      expect((@driver.title =~ /Search/).nil?).to be(true)
      expect((@driver.title =~ /Project/).nil?).to be(false)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".search-filter__project-chip").click
      wait_for_selector_none(".search-filter__project-chip--selected")
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      wait_for_text_change(text,"title", :css, 30)
      expect((@driver.title =~ /Project/).nil?).to be(true)
      expect((@driver.title =~ /Search/).nil?).to be(false)
    end

    it "should search and change sort criteria", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)

      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".search-query__recent-activity-button").click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".search-query__recent-added-button").click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search and change sort order", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

      wait_for_selector("#search__open-dialog-button").click
      @driver.find_element(:xpath, "//span[contains(text(), 'Newest')]").click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("#search__open-dialog-button").click
      @driver.find_element(:xpath, "//span[contains(text(), 'Oldest')]").click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__reset-button")
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search by project through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"projects"%3A%5B0%5D%7D'
      wait_for_selector(".search__results-heading")
      expect(@driver.page_source.include?('My search result')).to be(false)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-input")
      selected = @driver.find_elements(:css, '.search-query__filter-button--selected')
      expect(selected.size == 6).to be(true)
    end

    it "should search by date range", bin4: true do
      api_create_claim_and_go_to_search_page
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(true)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D'
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(false)

      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("#search-query__reset-button").click
      wait_for_selector(".date-range__start-date input").click
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector(".date-range__end-date input").click
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should change search sort criteria through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort"%3A"recent_activity"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-input")
      selected = @driver.find_elements(:css, '.search-query__filter-button--selected').map(&:text).sort
      expect(selected == ['Recent activity', 'Newest first', 'Links', 'Claims', 'Images', 'Videos'].sort).to be(true)
    end

    it "should change search sort order through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort_type"%3A"ASC"%7D'
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      selected = @driver.find_elements(:css, '.search-query__filter-button--selected').map(&:text).sort
      expect(selected).to eq(['Created', 'Oldest first', 'Links', 'Claims', 'Images', 'Videos'].sort)
    end

    it "should not reset password", bin5: true do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      wait_for_selector(".user-password-reset__email-input")
      expect(@driver.page_source.include?('email was not found')).to be(true)
      expect(@driver.page_source.include?('Password reset sent')).to be(false)
    end

    it "should set metatags", bin5: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'https://twitter.com/marcouza/status/875424957613920256'
      wait_for_selector(".tasks")
      request_api('make_team_public', { slug: get_team })
      wait_for_selector(".create-related-media__add-button")
      url = @driver.current_url.to_s
      @driver.navigate.to url
      site = @driver.find_element(:css, 'meta[name="twitter\\:site"]').attribute('content')
      expect(site == @config['app_name']).to be(true)
      twitter_title = @driver.find_element(:css, 'meta[name="twitter\\:title"]').attribute('content')
      expect(twitter_title == 'This is a test').to be(true)
    end

    it "should paginate project page", bin2: true do
      page = api_create_team_project_claims_sources_and_redirect_to_project_page 21
      page.load
      wait_for_selector("#create-media__add-item")
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath, 100).click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector("source-card", :class)
      results = @driver.find_elements(:css, '.medias__item')
      expect(results.size == 20).to be(true)
      old = results.size
      wait_for_selector(".search__next-page").click
      size = wait_for_size_change(old, '.medias__item')
      expect(size == 1).to be(true)
    end

    it "should show teams at /check/teams", bin1: true do
      api_create_team
      @driver.navigate.to @config['self_url'] + '/check/teams'
      wait_for_selector("teams", :class)
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should add, edit, answer, update answer and delete geolocation task", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      el = wait_for_selector('.create-task__add-geolocation')
      el.click
      wait_for_selector("#task-description-input" )
      fill_field('#task-label-input', 'Where?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
      fill_field('textarea[name="response"]', 'Salvador')
      fill_field('#task__response-geolocation-coordinates', '-12.9015866, -38.560239')
      el = wait_for_selector('.task__save')
      el.click
      wait_for_selector('.annotation--task_response_geolocation')
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Where was it?')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      el = wait_for_selector('.task-actions__edit')
      el.click
      wait_for_selector("#task-description-input" )
      update_field('#task-label-input', 'Where was it?')
      el = wait_for_selector( '.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where was it?')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      el = wait_for_selector('.task-actions__edit-response')
      el.click
      wait_for_selector(".task__cancel")
      update_field('textarea[name="response"]', 'Vancouver')
      update_field('#task__response-geolocation-coordinates', '49.2577142, -123.1941156')
      el = wait_for_selector('.task__save')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(true)

      # Delete task
      delete_task('Where was it')
    end

    it "should upload image when registering", bin3: true do
      email, password, avatar = ["test-#{Time.now.to_i}@example.com", '12345678', File.join(File.dirname(__FILE__), 'test.png')]
      page = LoginPage.new(config: @config, driver: @driver).load
             .register_and_login_with_email(email: email, password: password, file: avatar)
      me_page = MePage.new(config: @config, driver: page.driver).load
      wait_for_selector('.user-menu__edit-profile-button')
      script = "return window.getComputedStyle(document.getElementsByClassName('source__avatar')[0]).getPropertyValue('background-image')"
      avatar = @driver.execute_script(script)
      expect(avatar.include?('test.png')).to be(true)
    end

    it "should create claim", bin3: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
      wait_for_selector("#search__open-dialog-button")
      wait_for_selector("#create-media__add-item").click
      wait_for_selector("#create-media__quote").click
      wait_for_selector("#create-media-quote-attribution-source-input")
      @driver.action.send_keys('Test').perform
      expect((@driver.current_url.to_s =~ /media/).nil?).to be(true)
      @driver.action.send_keys(:enter).perform
      # press_button('#create-media-submit')
      wait_for_selector(".media-detail")
      wait_for_selector('.media-detail__check-timestamp').click
      wait_for_selector(".media-detail__card-header")
      expect((@driver.current_url.to_s =~ /media/).nil?).to be(false)
    end

    it "should redirect to last visited project", bin3: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      api_create_team_and_project(user: user)

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      wait_for_selector(".switch-teams__joined-team")
      link = wait_for_selector_list('.teams a').first
      link.click
      link = wait_for_selector('.team__project-title')
      link.click
      wait_for_selector_none(".team-members__edit-button")

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      wait_for_selector(".switch-teams__joined-team")
      link = wait_for_selector_list('.teams a').last
      link.click
      wait_for_selector(".team-members__edit-button")


      @driver.navigate.to(@config['self_url'])
      wait_for_selector('.main-title')
      notfound = @config['self_url'] + '/check/404'
      expect(@driver.current_url.to_s == notfound).to be(false)
    end

    it "should be able to find a team after signing up", bin5: true do
      user = api_register_and_login_with_email
      @driver.navigate.to @config['self_url']
      wait_for_selector('.find-team-card')
      expect(@driver.page_source.include?('Find an existing team')).to be(true)

      # return error for non existing team
      fill_field('#team-slug-container', 'non-existing-slug')
      el = wait_for_selector('.find-team__submit-button')
      el.click
      wait_for_selector('.find-team-card')
      expect(@driver.page_source.include?('Team not found!')).to be(true)

      # redirect to /team-slug/join if team exists
      # /team-slug/join in turn redirects to team page because already member
      page = CreateTeamPage.new(config: @config, driver: @driver).load
      wait_for_selector('.create-team__submit-button')
      team = "existing-team-#{Time.now.to_i}"
      api_create_team(team: team)
      @driver.navigate.to @config['self_url'] + '/check/teams/find'
      el = wait_for_selector('.find-team__submit-button')
      fill_field('#team-slug-container', team )
      el.click
      wait_for_selector('.join-team__button')
      expect(@driver.page_source.include?(team)).to be(true)

    end


    it "should search map in geolocation task", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(false)
      expect(@driver.page_source.include?('Task "Where?" created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      el = wait_for_selector('.create-task__add-geolocation')
      el.click
      wait_for_selector("#task-description-input")
      fill_field('#task-label-input', 'Where?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where?')).to be(true)

      # Search map
      wait_for_selector("#task__response-geolocation-name")
      expect(@driver.page_source.include?('SSA')).to be(false)
      fill_field("#geolocationsearch", "Salvador")
      wait_for_text_change(' ',"#geolocationsearch", :css, 30)
      expect(@driver.page_source.include?('SSA')).to be(true)
    end

    it "should go from one item to another", bin2: true do
      page = api_create_team_project_claims_sources_and_redirect_to_project_page 3
      page.load
      wait_for_selector('.media__heading a').click
      wait_for_selector('.media__notes-heading')

      # First item
      expect(@driver.page_source.include?('1 / 3')).to be(true)
      expect(@driver.page_source.include?('2 / 3')).to be(false)
      expect(@driver.page_source.include?('3 / 3')).to be(false)
      expect(@driver.page_source.include?('Claim 2')).to be(true)
      expect(@driver.page_source.include?('Claim 1')).to be(false)
      expect(@driver.page_source.include?('Claim 0')).to be(false)

      # Second item
      wait_for_selector('#media-search__next-item').click
      wait_for_selector('.media__notes-heading')
      expect(@driver.page_source.include?('1 / 3')).to be(false)
      expect(@driver.page_source.include?('2 / 3')).to be(true)
      expect(@driver.page_source.include?('3 / 3')).to be(false)
      expect(@driver.page_source.include?('Claim 2')).to be(false)
      expect(@driver.page_source.include?('Claim 1')).to be(true)
      expect(@driver.page_source.include?('Claim 0')).to be(false)

      # Third item
      wait_for_selector('#media-search__next-item').click
      wait_for_selector('.media__notes-heading')
      expect(@driver.page_source.include?('1 / 3')).to be(false)
      expect(@driver.page_source.include?('2 / 3')).to be(false)
      expect(@driver.page_source.include?('3 / 3')).to be(true)
      expect(@driver.page_source.include?('Claim 2')).to be(false)
      expect(@driver.page_source.include?('Claim 1')).to be(false)
      expect(@driver.page_source.include?('Claim 0')).to be(true)

      # Second item
      wait_for_selector('#media-search__previous-item').click
      wait_for_selector('.media__notes-heading')
      expect(@driver.page_source.include?('1 / 3')).to be(false)
      expect(@driver.page_source.include?('2 / 3')).to be(true)
      expect(@driver.page_source.include?('3 / 3')).to be(false)
      expect(@driver.page_source.include?('Claim 2')).to be(false)
      expect(@driver.page_source.include?('Claim 1')).to be(true)
      expect(@driver.page_source.include?('Claim 0')).to be(false)

      # First item
      wait_for_selector('#media-search__previous-item').click
      wait_for_selector('.media__notes-heading')
      expect(@driver.page_source.include?('1 / 3')).to be(true)
      expect(@driver.page_source.include?('2 / 3')).to be(false)
      expect(@driver.page_source.include?('3 / 3')).to be(false)
      expect(@driver.page_source.include?('Claim 2')).to be(true)
      expect(@driver.page_source.include?('Claim 1')).to be(false)
      expect(@driver.page_source.include?('Claim 0')).to be(false)
    end

    # Postponed due Alexandre's developement
    # it "should add and remove suggested tags" do
    #   skip("Needs to be implemented")
    # end
=begin

    ## Search by tag not working in QA

    it "should find medias when searching by tag" do
      data = api_create_team_and_project
      source = api_create_media(data: data, url: "https://www.facebook.com/permalink.php?story_fbid=10155901893214439&id=54421674438")
      #data = api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      @driver.navigate.to source.full_url
      wait_for_selector('cmd-input', :id)
      wait_for_selector('add-annotation__insert-photo', :class)
      fill_field('#cmd-input', '/tag tagtag')
      @driver.action.send_keys(:enter).perform
      sleep 5
      wait_for_size_change(0,'annotations__list-item', :class)

      media = api_create_media(data: data, url: "https://twitter.com/TwitterVideo/status/931930009450795009")
      @driver.navigate.to media.full_url
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      wait_for_selector(".search__results")
      old = wait_for_selector_list("medias__item", :class).length
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
      expect(@driver.page_source.include?('Meedan on Facebook')).to be(true)

      el = wait_for_selector("search-input", :id)
      el.clear
      el.click
      el.send_keys "tagtag"
      @driver.action.send_keys(:enter).perform
      sleep 3 #due the reload
      wait_for_selector("search-input", :id)
      current = wait_for_selector_list("medias__item", :class).length
      expect(old > current).to be(true)
      expect(current > 0).to be(true)
      expect(@driver.page_source.include?('Meedan on Facebook')).to be(true)
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(false)
    end
=end

  end
end
