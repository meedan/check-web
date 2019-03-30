require 'selenium-webdriver'
require 'appium_lib'
require 'yaml'
require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './pages/login_page.rb'
require_relative './pages/me_page.rb'
require_relative './pages/page.rb'
require_relative './api_helpers.rb'

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
      @wait.until {
        elems = @driver.find_elements(:css => ".team-members__list > div > div > div > div")
        expect(elems.size).to be > 1
      }

      #edit team member role
      wait_for_selector('.team-members__edit-button', :css).click
      wait_for_selector('.role-select', :css, 29, 1).click

      wait_for_selector('li.role-journalist').click
      wait_for_selector('.team-members__edit-button', :css).click

      el = wait_for_selector('input[name="role-select"]', :css, 29, 1)
      expect(el.value).to eq 'journalist'
    end

    it "should login using Twitter", bin5: true, quick: true do
      login_with_twitter
      @driver.navigate.to @config['self_url'] + '/check/me'
      sleep 5
      displayed_name = wait_for_selector('h1.source__name').text.upcase
      expected_name = @config['twitter_name'].upcase
      expect(displayed_name == expected_name).to be(true)
    end

    it "should add a comment to a task", bin5: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      el = wait_for_selector('.create-task__add-button', :css)
      el.click
      sleep 5
      el = wait_for_selector('.create-task__add-short-answer', :css)
      el.location_once_scrolled_into_view
      sleep 3
      el.click
      wait_for_selector('#task-label-input', :css)
      fill_field('#task-label-input', 'Test')
      el = wait_for_selector('.create-task__dialog-submit-button', :css)
      el.click
      media_pg.wait_all_elements(2, "annotations__list-item", :class)
      sleep 10

      # Add comment to task
      expect(@driver.page_source.include?('<span>1</span>')).to be(false)
      wait_for_selector('.task__log-top span', :css).click
      sleep 5
      fill_field('#cmd-input', 'This is a comment under a task')
      @driver.action.send_keys(:enter).perform
      sleep 20
      expect(@driver.page_source.include?('<span>1</span>')).to be(true)
    end

    it "should manage team tasks", bin6: true do
      # Create team and go to team page that should not contain any task
      team = "task-team-#{Time.now.to_i}"
      api_create_team(team: team, limits: '{ "custom_tasks_list": true }')
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + team)
      wait_for_selector('.team-menu__team-settings-button').click
      wait_for_selector('.team-settings__tasks-tab').click
      expect(@driver.page_source.include?('No teamwide tasks to display')).to be(true)
      expect(@driver.page_source.include?('No tasks')).to be(true)
      expect(@driver.page_source.include?('New teamwide task')).to be(false)

      # Create task
      wait_for_selector('.create-task__add-button').click
      wait_for_selector('.create-task__add-short-answer').click
      fill_field('#task-label-input', 'New teamwide task')
      wait_for_selector('.create-task__dialog-submit-button').click
      sleep 5
      expect(@driver.page_source.include?('No teamwide tasks to display')).to be(false)
      expect(@driver.page_source.include?('1 task')).to be(true)
      expect(@driver.page_source.include?('New teamwide task')).to be(true)

      # Edit task
      wait_for_selector('.team-tasks__menu-item-button').click
      wait_for_selector('.team-tasks__edit-button').click
      fill_field('#task-label-input', '-EDITED')
      wait_for_selector('#edit-task__required-switch').click ; sleep 5
      wait_for_selector('.create-task__dialog-submit-button').click
      wait_for_selector('#confirm-dialog__checkbox').click
      wait_for_selector('#confirm-dialog__confirm-action-button').click
      sleep 5
      expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)
      expect(@driver.find_element(:css, '.task__required').text == '*').to be(true)

      # Delete tag
      wait_for_selector('.team-tasks__menu-item-button').click
      wait_for_selector('.team-tasks__delete-button').click
      wait_for_selector('#confirm-dialog__checkbox').click
      wait_for_selector('#confirm-dialog__confirm-action-button').click
      sleep 5
      expect(@driver.page_source.include?('No tasks')).to be(true)
      expect(@driver.page_source.include?('New teamwide task')).to be(false)
    end

    it "should manage team tags", bin6: true do
      # Create team and go to team page that should not contain any tag
      team = "tag-team-#{Time.now.to_i}"
      api_create_team(team: team)
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + team)
      wait_for_selector('.team-menu__team-settings-button').click ; sleep 5
      wait_for_selector('.team-settings__tags-tab').click ; sleep 5
      expect(@driver.page_source.include?('No team tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetag')).to be(false)

      # Create tag
      fill_field('#tag__new', 'newteamwidetag')
      @driver.action.send_keys(:enter).perform
      sleep 10
      expect(@driver.page_source.include?('No team tags')).to be(false)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(false)

      # Edit tag
      wait_for_selector('#tag__text-newteamwidetag button').click
      sleep 5
      wait_for_selector('.tag__edit').click
      sleep 1
      fill_field('#tag__edit', 'edited')
      @driver.action.send_keys(:enter).perform
      sleep 10
      expect(@driver.page_source.include?('No team tags')).to be(false)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(true)

      # Delete tag
      wait_for_selector('#tag__text-newteamwidetagedited button').click
      sleep 5
      wait_for_selector('.tag__delete').click
      sleep 1
      wait_for_selector('#tag__confirm').click
      sleep 2
      wait_for_selector('#tag__confirm-delete').click
      sleep 10
      expect(@driver.page_source.include?('No team tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(false)
    end

    it "should add, edit, answer, update answer and delete datetime task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      expect(@driver.page_source.include?('When?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      old = wait_for_selector_list("annotation__default-content",:class).length
      el = wait_for_selector('.create-task__add-button')
      el.click
      sleep 5
      el = wait_for_selector('.create-task__add-datetime')
      el.click
      sleep 1
      fill_field('#task-label-input', 'When?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('When?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(false)
      fill_field('input[name="hour"]', '23')
      fill_field('input[name="minute"]', '59')
      el = wait_for_selector('#task__response-date')
      el.click
      el = wait_for_selector_list('button')
      el.last.click
      sleep 5
      el = wait_for_selector('.task__save')
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('When was it?')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      el = wait_for_selector(".task-actions__edit")
      @driver.action.move_to(el).perform
      el.click
      sleep 1
      wait_for_selector("//textarea[contains(text(), 'When?')]", :xpath)
      update_field('#task-label-input', 'When was it?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('When was it?')).to be(true)

      # Edit task response
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      el = wait_for_selector('.task-actions__edit-response')
      el.click
      update_field('input[name="hour"]', '12')
      update_field('input[name="minute"]', '34')
      el = wait_for_selector('.task__save')
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(true)

      # Delete task
      delete_task('When was it')
    end

    it "should filter by medias or sources", bin6: true do
      api_create_team_project_and_link 'https://twitter.com/TheWho/status/890135323216367616'
      @driver.navigate.to @config['self_url']
      wait_for_selector("card-with-border", :class)
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(false)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath).click
      wait_for_selector("source-card", :class)
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
      old = @driver.find_elements(:class, "medias__item").length
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//span[contains(text(), 'Media')]", :xpath).click
      wait_for_size_change(old, "medias__item", :class)
      @wait.until { @driver.page_source.include?('@thewho') }
      expect(@driver.page_source.include?("The Who's official Twitter page")).to be(true)
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(false)
    end

    it "should register and create a claim", bin4: true do
      page = LoginPage.new(config: @config, driver: @driver).load
      page = page.register_and_login_with_email(email: "sysops+#{Time.now.to_i}#{rand(1000)}@meedan.com", password: @password)
      page
        .create_team
        .create_project
        .create_media(input: 'Claim')
        .logout
    end

    it "should redirect to access denied page", bin1: true do
      user = api_register_and_login_with_email
      api_logout
      api_register_and_login_with_email
      me_pg = MePage.new(config: @config, driver: @driver).load
      sleep 3 #for loading
      wait_for_selector("teams-tab", :id).click; sleep 1
      wait_for_selector("//span[contains(text(), 'Create Team')]", :xpath)
      expect(@driver.page_source.include?('Access Denied')).to be(false)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(true)
      unauthorized_pg = SourcePage.new(id: user.dbid, config: @config, driver: @driver).load
      sleep 3 #for loading
      wait_for_selector("main-title", :class)
      expect(@driver.page_source.include?('Access Denied')).to be(true)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
    end

    it "should edit the description of a media", bin4: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      media_pg.wait_for_element('.media-detail')
      media_pg.toggle_card # Make sure the card is closed
      expect(media_pg.contains_string?('Edited media description')).to be(false)
      media_pg.toggle_card # Expand the card so the edit button is accessible
      media_pg.wait_for_element('.media-actions')
      sleep 3 # Clicks can misfire if pender iframe moves the button position at the wrong moment
      media_pg.set_description('Edited media description')
      expect(media_pg.contains_string?('Edited media description')).to be(true)
    end

    it "should edit the title of a media", bin1: true do
      url = 'https://twitter.com/softlandscapes/status/834385935240462338'
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page url
      media_pg.wait_for_element('.media-detail')
      media_pg.toggle_card # Make sure the card is closed
      expect(media_pg.primary_heading.text).to eq('https://t.co/i17DJNqiWX')
      media_pg.toggle_card # Expand the card so the edit button is accessible
      media_pg.wait_for_element('.media-actions')
      sleep 3 # Clicks can misfire if pender iframe moves the button position at the wrong moment
      media_pg.set_title('Edited media title')
      expect(media_pg.primary_heading.text).to eq('Edited media title')
      project_pg = media_pg.go_to_project
      project_pg.wait_for_element('.media__heading')
      expect(project_pg.elements('.media__heading').map(&:text).include?('Edited media title')).to be(true)
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

    it "should display a default title for new media", bin1: true, quick:true do
      # Tweets
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/firstdraftnews/status/835587295394869249')
      media_pg.toggle_card # Collapse card to show the title
      expect(media_pg.primary_heading.text.include?('In a chat about getting')).to be(true)
      project_pg = media_pg.go_to_project
      sleep 1
      @wait.until {
        element = @driver.find_element(:partial_link_text, 'In a chat about getting')
        expect(element.displayed?).to be(true)
      }

      # YouTube
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
      media_pg.toggle_card # Collapse card to show the title
      expect(media_pg.primary_heading.text).to eq("How To Check An Account's Authenticity")
      project_pg = media_pg.go_to_project
      sleep 5
      expect(project_pg.elements('.media__heading').map(&:text).include?("How To Check An Account's Authenticity")).to be(true)

      # Facebook
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
      media_pg.toggle_card # Collapse card to show the title
      wait_for_selector('.media__heading')
      expect(media_pg.primary_heading.text).to eq('First Draft on Facebook')
      project_pg = media_pg.go_to_project
      wait_for_selector('.media__heading')
      expect(project_pg.elements('.media__heading').map(&:text).include?('First Draft on Facebook')).to be(true)
    end

    it "should login using Slack", bin4: true, quick:true do
      login_with_slack
      @driver.navigate.to @config['self_url'] + '/check/me'
      displayed_name = wait_for_selector('h1.source__name').text.upcase
      expected_name = @config['slack_name'].upcase
      expect(displayed_name == expected_name).to be(true)
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

    it "should create a project for a team", bin3: true do
      team = api_create_team
      @driver.navigate.to @config['self_url']
      project_name = "Project #{Time.now}"
      project_pg = TeamPage.new(config: @config, driver: @driver).create_project(name: project_name)

      expect(project_pg.driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
      team_pg = project_pg.click_team_link
      sleep 5
      element = wait_for_selector('.team__project-title')
      expect(element.text == project_name).to be(true)
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
      sleep 2
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))

      sleep 2
      wait_for_selector("add-annotation__buttons", :class)
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'
      sleep 5
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
      sleep 1
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

    it "should create source and redirect to newly created source", bin6: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 15
      wait_for_selector("create-media__add-item", :id).click
      wait_for_selector("create-media__source", :id).click
      # @driver.find_element(:css, '#').click
      sleep 1
      fill_field('#create-media-source-name-input', @source_name)
      fill_field('#create-media-source-url-input', @source_url)
      sleep 1
      # wait_for_selector('create-media-dialog__submit-button', :id).click
      wait_for_selector('create-media-dialog__submit-button', :id).click
      sleep 45
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(false)
      title = wait_for_selector('.source__name').text
      expect(title == @source_name).to be(true)
    end

    it "should not create duplicated source", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('Megadeth', 'https://twitter.com/megadeth')
      id1 = @driver.current_url.to_s.gsub(/^.*\/source\//, '').to_i
      expect(id1 > 0).to be(true)
      @driver.navigate.to @driver.current_url.to_s.gsub(/\/source\/[0-9]+$/, '')
      wait_for_selector("create-media__add-item", :id).click
      wait_for_selector("create-media-submit", :id)
      el = wait_for_selector('#create-media__source')
      el.click
      sleep 1
      fill_field('#create-media-source-name-input', 'Megadeth')
      fill_field('#create-media-source-url-input', 'https://twitter.com/megadeth')
      sleep 1
      wait_for_selector('create-media-dialog__submit-button', :id).click
      wait_for_selector("source__tab-button-account", :class)
      id2 = @driver.current_url.to_s.gsub(/^.*\/source\//, '').to_i
      expect(id2 > 0).to be(true)
      expect(id1 == id2).to be(true)
    end

    it "should tag source as a command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      wait_for_selector('source__tab-button-account', :class)
      expect(@driver.page_source.include?('command')).to be(false)
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      wait_for_selector('add-annotation__insert-photo', :class)
      expect(@driver.page_source.include?('Tagged #command')).to be(false)
      fill_field('#cmd-input', '/tag command')
      @driver.action.send_keys(:enter).perform
      sleep 5
      wait_for_size_change(0,'annotations__list-item', :class)
      expect(@driver.page_source.include?('Tagged #command')).to be(true)
      @driver.navigate.refresh
      sleep 3
      wait_for_selector('source__tab-button-account', :class)
      expect(@driver.page_source.include?('command')).to be(true)
    end

    it "should comment source as a command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('The Beatles', 'https://twitter.com/thebeatles')
      wait_for_selector('source__tab-button-account', :class)
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      expect(@driver.page_source.include?('This is my comment')).to be(false)
      old = @driver.find_elements(:class,"annotations__list-item").length
      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      wait_for_size_change(old,'annotations__list-item', :class)
      expect(@driver.page_source.include?('This is my comment')).to be(true)
      @driver.navigate.refresh
      sleep 5
      wait_for_selector('source__tab-button-account', :class)
      el = wait_for_selector('.source__tab-button-notes')
      el.click
      wait_for_selector('annotation__card-content', :class)
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should not create report as source", bin6: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 5
      wait_for_selector("create-media__add-item", :id).click
      @driver.find_element(:css, '#create-media__source').click
      sleep 1
      fill_field('#create-media-source-url-input', 'https://twitter.com/IronMaiden/status/832726327459446784')
      sleep 1
      wait_for_selector('create-media-dialog__submit-button', :id).click
      sleep 15
      expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
      message = wait_for_selector('.message').text
      expect(message.match(/Sorry, this is not a profile/).nil?).to be(false)
    end

    it "should tag source multiple times with commas with command", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('Motorhead', 'https://twitter.com/mymotorhead')
      sleep 5
      wait_for_selector('.source__tab-button-notes').click

      fill_field('#cmd-input', '/tag foo, bar')
      @driver.action.send_keys(:enter).perform
      sleep 10

      expect(@driver.page_source.include?('Tagged #foo')).to be(true)
      expect(@driver.page_source.include?('Tagged #bar')).to be(true)
    end

    it "should edit basic source data (name, description/bio, avatar)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
      el = wait_for_selector("source-menu__edit-source-button", :class)
      el.click
      input = wait_for_selector('source__name-container', :id)
      input.send_keys(" - EDIT ACDC")
      input = wait_for_selector('source__bio-container', :id)
      input.send_keys(" - EDIT DESC")
      el = wait_for_selector("source__edit-avatar-button", :class)
      el.click
      sleep 1
      input = wait_for_selector('input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      sleep 1
      @driver.find_element(:class, 'source__edit-save-button').click
      sleep 5
      displayed_name = wait_for_selector('h1.source__name').text
      expect(displayed_name.include? "EDIT").to be(true)
    end

    it "should add and remove accounts to sources", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      wait_for_selector("source__tab-button-account",:class)
      element = wait_for_selector("source-menu__edit-source-button",:class)
      element.click
      sleep 1
      element = wait_for_selector("source__edit-addinfo-button",:class)
      element.click
      sleep 1
      element = wait_for_selector("source__add-link",:class)
      element.click
      sleep 1
      fill_field("source__link-input0", "www.acdc.com", :id)
      sleep 2
      element = wait_for_selector( 'source__edit-save-button',:class)
      element.click
      wait_for_selector('media-tags', :class)
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(true)

      #networks tab
      element = @driver.find_element(:class, "source__tab-button-account")
      element.click
      wait_for_selector('source-card',:class)
      expect(@driver.page_source.include?('The Official AC/DC website and store')).to be(true)

      #delete
      element = wait_for_selector("source-menu__edit-source-button",:class)
      element.click
      sleep 3
      list = wait_for_selector_list("svg[class='create-task__remove-option-button create-task__md-icon']")
      element = wait_for_selector_list('.source__remove-link-button')[1]
      element.click
      element = wait_for_selector('source__edit-save-button',:class)
      element.click
      sleep 1
      wait_for_selector( 'media-tags',:class)
      expect(@driver.page_source.include?('AC/DC Official Website')).to be(false)
    end

    it "should edit source metadata (contact, phone, location, organization, other)", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      sleep 5 #Loading
      wait_for_selector('.source__tab-button-account')
      expect(@driver.page_source.include?('label: value')).to be(false)
      expect(@driver.page_source.include?('Location 123')).to be(false)
      expect(@driver.page_source.include?('ORGANIZATION')).to be(false)
      expect(@driver.page_source.include?('989898989')).to be(false)
      el = wait_for_selector('.source-menu__edit-source-button')
      el.click
      sleep 1
      el = wait_for_selector('.source__edit-addinfo-button')
      el.click
      sleep 1
      el = wait_for_selector('.source__add-phone')
      el.click
      fill_field('.source__metadata-phone-input input[type="text"]', '989898989')
      sleep 1
      @driver.find_element(:class, "source__edit-addinfo-button").click
      sleep 1
      el = wait_for_selector(".source__add-organization")
      el.click
      fill_field('.source__metadata-organization-input input[type="text"]', 'ORGANIZATION')
      el = wait_for_selector(".source__edit-addinfo-button")
      el.click
      sleep 1
      el = wait_for_selector(".source__add-location")
      el.click
      fill_field('.source__metadata-location-input input[type="text"]', 'Location 123')
      sleep 1
      #source__add-other
      el = wait_for_selector(".source__edit-addinfo-button")
      el.click
      sleep 1
      el = wait_for_selector(".source__add-other")
      el.click
      sleep 1
      fill_field("source__other-label-input", "label", :id)
      fill_field("source__other-value-input", "value", :id)
      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\t").perform
      @driver.action.send_keys("\n").perform
      sleep 2
      el = wait_for_selector(".source__edit-save-button")
      el.click
      sleep 5 #reload
      wait_for_selector('.source-menu__edit-source-button')
      expect(@driver.page_source.include?('label: value')).to be(true)
      expect(@driver.page_source.include?('Location 123')).to be(true)
      expect(@driver.page_source.include?('ORGANIZATION')).to be(true)
      expect(@driver.page_source.include?('989898989')).to be(true)

      # Now try to edit
      wait_for_selector('.source-menu__edit-source-button').click
      sleep 1
      fill_field('.source__metadata-phone-input input[type="text"]', '121212121')
      wait_for_selector('.source__edit-save-button').click
      sleep 5 #reload
      wait_for_selector('.source-menu__edit-source-button')
      expect(@driver.page_source.include?('121212121')).to be(true)
    end

    it "should add and remove source tags", bin6: true do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      element =  wait_for_selector("source-menu__edit-source-button", :class,60)
      element.click
      sleep 1
      element =  wait_for_selector("source__edit-addinfo-button", :class)
      element.click
      sleep 1
      element =  wait_for_selector("source__add-tags", :class)
      element.click
      sleep 1
      fill_field("sourceTagInput", "TAG1", :id)
      @driver.action.send_keys("\n").perform
      fill_field("sourceTagInput", "TAG2", :id)
      @driver.action.send_keys("\n").perform
      sleep 3
      element =  wait_for_selector("source__edit-save-button", :class)
      element.click
      sleep 3
      wait_for_selector("source-menu__edit-source-button", :class, 60)
      expect(@driver.page_source.include?('TAG1')).to be(true)
      expect(@driver.page_source.include?('TAG2')).to be(true)

      #delete
      element = wait_for_selector("source-menu__edit-source-button",:class)
      element.click
      wait_for_selector("source__edit-buttons-add-merge", :class, 60)
      list = wait_for_selector_list("div.source-tags__tag svg")
      list[0].click
      sleep 1
      element =  wait_for_selector("source__edit-save-button", :class)
      element.click
      wait_for_selector("source__tab-button-account", :class, 60)
      list = wait_for_selector_list("div.source-tags__tag")
      expect(list.length == 1).to be(true)
    end

    it "should add and remove source languages", bin6: true  do
      api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
      wait_for_selector("source__tab-button-account",:class)
      element = wait_for_selector("source-menu__edit-source-button",:class)
      element.click
      wait_for_selector("source__edit-buttons-cancel-save",:class)
      element = wait_for_selector("source__edit-addinfo-button",:class)
      element.click
      sleep 2
      element = wait_for_selector("source__add-languages",:class)
      element.click
      sleep 2
      fill_field("sourceLanguageInput", "Acoli", :id)
      element = wait_for_selector('span[role="menuitem"]');
      element.click
      sleep 1
      wait_for_size_change(0, "sourceLanguageInput",:id)
      element = wait_for_selector("source__edit-save-button",:class)
      element.click
      sleep 2
      wait_for_selector("source-tags__tag",:class)
      expect(@driver.page_source.include?('Acoli')).to be(true)
      element = wait_for_selector("source-menu__edit-source-button",:class)
      element.click
      sleep 1
      elements =wait_for_selector_list("div.source-tags__tag svg")
      elements[0].click
      sleep 1
      element = wait_for_selector("source__edit-save-button",:class)
      element.click
      sleep 2
      wait_for_selector("source__tab-button-media",:class)
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
      sleep 3
      wait_for_selector("medias__item",:class)
      wait_for_selector("create-media__add-item", :id).click
      fill_field('#create-media-input', @media_url)
      sleep 2
      wait_for_selector('create-media-dialog__submit-button', :id).click
      wait_for_selector("add-annotation__insert-photo",:class)
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

    it "should comment media as a command", bin4: true, quick:true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')
      # First, verify that there isn't any comment
      expect(@driver.page_source.include?('This is my comment')).to be(false)
      old = wait_for_selector_list('annotations__list-item', :class)

      # Add a comment as a command
      fill_field('#cmd-input', '/comment This is my comment')
      @driver.action.send_keys(:enter).perform
      sleep 5
      wait_for_size_change(old,'annotations__list-item', :class)

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment')).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      sleep 5
      wait_for_selector('.annotations__list-item')
      expect(@driver.page_source.include?('This is my comment')).to be(true)
    end

    it "should flag media as a command", bin4: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page

      expect(media_pg.contains_string?('Flag')).to be(false)

      media_pg.fill_input('#cmd-input', '/flag Spam')
      media_pg.element('#cmd-input').submit
      sleep 5

      expect(media_pg.contains_string?('Flag')).to be(true)
      media_pg.driver.navigate.refresh
      media_pg.wait_for_element('.media')
      expect(media_pg.contains_string?('Flag')).to be(true)
    end

    it "should edit project", bin1: true do
      api_create_team_and_project
      project_pg = ProjectPage.new(config: @config, driver: @driver).load
      new_title = "Changed title #{Time.now.to_i}"
      new_description = "Set description #{Time.now.to_i}"
      expect(project_pg.contains_string?(new_title)).to be(false)
      expect(project_pg.contains_string?(new_description)).to be(false)
      #7204 edit title and description separately
      project_pg.edit(title: new_title, description: "")
      expect(@driver.page_source.include?(new_title)).to be(true)
      expect(@driver.page_source.include?(new_description)).to be(false)
      wait_for_selector('.project-menu', :css)
      #7204 edit title and description separately
      project_pg.edit(description: new_description)
      expect(@driver.page_source.include?(new_title)).to be(true)
      expect(@driver.page_source.include?(new_description)).to be(true)
    end

    it "should redirect to 404 page if id does not exist", bin4: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      sleep 3
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

    it "should show 'manage team' link only to team owners", bin3: true do
      user = api_register_and_login_with_email
      team = request_api 'team', { name: "team#{Time.now.to_i}", email: user.email, slug: "team#{Time.now.to_i}" }
      user2 = api_register_and_login_with_email
      page = MePage.new(config: @config, driver: @driver).load
      page.ask_join_team(subdomain: team.slug)
      @wait.until {
        expect(@driver.find_element(:class, "message").nil?).to be(false)
      }
      api_logout
      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+user.email)
      #As the group creator, go to the members page and approve the joining request.
      page = MePage.new(config: @config, driver: @driver).load
          .approve_join_team(subdomain: team.slug)
      el = wait_for_selector_list("team-menu__edit-team-button",:class)
      expect(el.length > 0).to be(true)
      api_logout

      @driver = new_driver(webdriver_url,browser_capabilities)
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+user2.email)
      page = MePage.new(config: @config, driver: @driver).load
      el = wait_for_selector_list("team-menu__edit-team-button",:class)
      expect(el.length == 0).to be(true)
    end

    it "should show 'edit project' link only to users with 'update project' permission", bin3: true do
      utp = api_create_team_project_and_two_users
      page = Page.new(config: @config, driver: @driver)
      page.go(@config['api_path'] + '/test/session?email='+utp[:user1]["email"])
      page.go(@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
      sleep 3 #for loading
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath)
      l = wait_for_selector_list('project-menu',:class)
      expect(l.length == 1).to be(true)

      page.go(@config['api_path'] + '/test/session?email='+utp[:user2]["email"])
      page.go(@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
      sleep 3 #for loading
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath)
      l = wait_for_selector_list('project-menu',:class)
      expect(l.length == 0).to be(true)
    end

    it "should edit team and logo", bin1: true do
      team = "testteam#{Time.now.to_i}"
      api_create_team(team:team)
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + team)
      wait_for_selector("team-menu__edit-team-button", :class)
      expect(@driver.page_source.include?('Rome')).to be(false)
      expect(@driver.page_source.include?('www.meedan.com')).to be(false)
      expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(false)
      expect(@driver.page_source.include?(" - EDIT")).to be(false)

      el = wait_for_selector('.team-menu__edit-team-button')
      el.click

      el = wait_for_selector("team__name-container", :id)
      el.click
      el.send_keys " - EDIT"

      el = wait_for_selector("team__description-container", :id)
      el.click
      el.send_keys "EDIT DESCRIPTION"

      el = wait_for_selector("team__location-container", :id)
      el.click
      el.send_keys "Rome"

      el = wait_for_selector("team__phone-container", :id)
      el.click
      el.send_keys "555199889988"

      el = wait_for_selector("team__link-container", :id)
      el.click
      el.send_keys "www.meedan.com"

      #Logo
      el = wait_for_selector(".team__edit-avatar-button")
      el.click

      input = wait_for_selector('input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))

      el = wait_for_selector("source__edit-save-button", :class)
      el.click
      wait_for_selector("team__primary-info", :class)
      expect(@driver.page_source.include?('Rome')).to be(true)
      expect(@driver.page_source.include?('www.meedan.com')).to be(true)
      expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(true)
      expect(@driver.page_source.include?(" - EDIT")).to be(true)
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

      wait_for_selector('team__primary-info',:class)
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
      sleep 1
      page = MePage.new(config: @config, driver: @driver).load
      @driver.navigate.to @config['self_url'] + '/'+@team1_slug
      sleep 2
      wait_for_selector('team-members__member',:class)
      el = wait_for_selector('team-members__edit-button',:class)
      el.click
      sleep 5
      l = wait_for_selector_list('team-members__delete-member', :class)
      old = l.length
      expect(l.length > 1).to be(true)
      l[l.length-1].click
      page.wait_all_elements(old - 1, 'team-members__delete-member', :class)
      expect(wait_for_selector_list('team-members__delete-member', :class).length < old).to be(true)
    end

    it "should update notes count after delete annotation", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      media_pg.fill_input('#cmd-input', 'Test')
      media_pg.element('#cmd-input').submit
      sleep 5
      notes_count_before = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
      expect(notes_count_before > 0).to be(true)
      expect(@driver.page_source.include?('Comment deleted')).to be(false)
      media_pg.delete_annotation
      wait_for_selector('.annotation__deleted')
      sleep 5
      notes_count_after = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
      expect(notes_count_after > 0).to be(true)
      expect(notes_count_after == notes_count_before).to be(true) # Count should be the same because the comment is replaced by the "comment deleted" annotation
      expect(@driver.page_source.include?('Comment deleted')).to be(true)
    end

    it "should autorefresh project when media is created", bin1: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      url = @driver.current_url
      wait_for_selector('#create-media-input')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector("create-media__add-item", :id).click
      wait_for_selector("create-media-input", :id).click
      fill_field('#create-media-input', 'Auto-Refresh')
      wait_for_selector('create-media-dialog__submit-button', :id).click
      wait_for_selector('.medias__item')
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)
      wait_for_selector('.medias__item')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    it "should autorefresh media when annotation is created", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      url = media_pg.driver.current_url
      wait_for_selector('#cmd-input')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      media_pg.fill_input('#cmd-input', 'Auto-Refresh')
      media_pg.element('#cmd-input').submit
      wait_for_selector('.annotation__card-activity-create-comment')
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)
      wait_for_selector('.annotation__card-activity-create-comment')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
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
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('Note added')).to be(false)
      old = wait_for_selector_list("annotation__default-content", :class).length
      fill_field('textarea[name="cmd"]', 'https://meedan.com/en/')
      el = wait_for_selector(".add-annotation button[type=submit]")
      el.click
      sleep 2 #wait for loading
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('Note added')).to be(true)
      el = wait_for_selector_list("//a[contains(text(), 'https://meedan.com/en/')]", :xpath)
      expect(el.length == 1).to be(true)
    end

    it "should find all medias with an empty search", bin1: true do
      api_create_media_and_go_to_search_page
      old = wait_for_selector_list("medias__item", :class).length
      wait_for_selector("search__open-dialog-button", :id).click
      el = wait_for_selector("search-input", :id)
      el.click
      @driver.action.send_keys(:enter).perform
      sleep 3 #due the reload
      # wait_for_selector("search__open-dialog-button", :id)
      current = wait_for_selector_list("medias__item", :class).length
      expect(old == current).to be(true)
      expect(current > 0).to be(true)
    end

    it "should find medias when searching by keyword", bin2: true do
      data = api_create_team_and_project
      api_create_media(data: data, url: "https://www.facebook.com/permalink.php?story_fbid=10155901893214439&id=54421674438")
      media = api_create_media(data: data, url: "https://twitter.com/TwitterVideo/status/931930009450795009")
      @driver.navigate.to @config['self_url'] + '/' + data[:team].slug + '/search'
      sleep 15 # because ES works on the background
      wait_for_selector("//span[contains(text(), '2 items')]",:xpath)
      old = wait_for_selector_list("medias__item", :class).length
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
      expect(@driver.page_source.include?('Meedan on Facebook')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      el = wait_for_selector("search-input", :id)
      el.click
      el.send_keys "video"
      @driver.action.send_keys(:enter).perform
      sleep 3 # due the load
      wait_for_selector("//span[contains(text(), '1 item')]",:xpath)
      current = wait_for_selector_list("medias__item", :class).length
      expect(old > current).to be(true)
      expect(current > 0).to be(true)
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
      expect(@driver.page_source.include?('Meedan on Facebook')).to be(false)
      wait_for_selector("search__open-dialog-button", :id).click
      el = wait_for_selector("search-input", :id)
      el.clear
      el.click
      el.send_keys "meedan"
      @driver.action.send_keys(:enter).perform
      sleep 3 # due the load
      wait_for_selector("//span[contains(text(), '1 item')]",:xpath)
      current = wait_for_selector_list("medias__item", :class).length
      expect(old > current).to be(true)
      expect(current > 0).to be(true)
      expect(@driver.page_source.include?('Meedan on Facebook')).to be(true)
      expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(false)
    end

    it "should move media to another project", bin2: true do
      claim = 'This is going to be moved'
      claim_name = case @config['app_name']
      when 'bridge'
        'quote'
      when 'check'
        'claim'
      end

      # Create a couple projects under the same team
      p1 = api_create_team_and_project
      p1url = @config['self_url'] + '/' + p1[:team].slug + '/project/' + p1[:project].dbid.to_s
      p2 = api_create_project(p1[:team].dbid.to_s)
      p2url = @config['self_url'] + '/' + p2.team['slug'] + '/project/' + p2.dbid.to_s

      # Go to the first project, make sure that there is no claim, and thus store the data in local Relay store
      @driver.navigate.to p1url
      sleep 10
      expect(@driver.page_source.include?(claim)).to be(false)
      expect(@driver.page_source.include?('1 item')).to be(false)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(true)

      # Go to the second project, make sure that there is no claim, and thus store the data in local Relay store
      wait_for_selector('.header-actions__drawer-toggle', :css).click
      sleep 2
      wait_for_selector('.project-list__link + .project-list__link', :css).click
      sleep 10
      expect(@driver.page_source.include?(claim)).to be(false)
      expect(@driver.page_source.include?('1 item')).to be(false)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(true)

      # Create a claim under project 2
      wait_for_selector("create-media__add-item", :id).click
      wait_for_selector('create-media__quote', :id).click
      sleep 1
      @driver.action.send_keys(claim).perform
      @driver.action.send_keys(:enter).perform
      sleep 10

      # Go to the second project, make sure that the claim is there
      wait_for_selector('.header-actions__drawer-toggle', :css).click
      sleep 2
      wait_for_selector('.project-list__link + .project-list__link', :css).click
      sleep 10
      expect(@driver.page_source.include?(claim)).to be(true)
      expect(@driver.page_source.include?('1 item')).to be(true)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(false)

      # Move the claim to another project
      wait_for_selector('.card-with-border > div > div > div + button svg', :css).click
      sleep 2
      wait_for_selector('.media-actions__icon', :css).click
      sleep 2
      move = wait_for_selector('.media-actions__move', :css)
      move.location_once_scrolled_into_view
      move.click
      sleep 2
      move = wait_for_selector('input[name=moveMedia]', :css)
      move.location_once_scrolled_into_view
      move.click
      sleep 2
      move = wait_for_selector('.media-detail__move-button', :css)
      move.location_once_scrolled_into_view
      move.click
      sleep 10

      # Check if the claim is under the first project, which we should have been redirected to
      expect(@driver.current_url.to_s == p1url).to be(true)
      expect(@driver.page_source.include?(claim)).to be(true)
      expect(@driver.page_source.include?('1 item')).to be(true)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(false)

      # Go back to the second project and make sure that the claim is not there anymore
      wait_for_selector('.header-actions__drawer-toggle', :css).click
      sleep 2
      wait_for_selector('.project-list__link + .project-list__link', :css).click
      sleep 15
      expect(@driver.page_source.include?('1 item')).to be(false)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(true)

      # Reload the first project page and make sure that the claim is there
      @driver.navigate.to p1url
      sleep 10
      expect(@driver.page_source.include?(claim)).to be(true)
      expect(@driver.page_source.include?('1 item')).to be(true)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(false)

      # Reload the second project page and make sure that the claim is not there
      @driver.navigate.to p2url
      sleep 10
      expect(@driver.page_source.include?(claim)).to be(false)
      expect(@driver.page_source.include?('1 item')).to be(false)
      expect(@driver.page_source.include?("Add a link or #{claim_name}")).to be(true)
    end

    it "should add, edit, answer, update answer and delete short answer task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      expect(@driver.page_source.include?('Foo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task created by User With Email: Foo or bar?')).to be(false)

      el = wait_for_selector('.create-task__add-button', :css)
      el.click
      el = wait_for_selector('.create-task__add-short-answer', :css)
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input', :css)
      fill_field('#task-label-input', 'Foo or bar?')
      el = wait_for_selector('.create-task__dialog-submit-button', :css)
      el.click
      media_pg.wait_all_elements(2, "annotations__list-item", :class) #Wait for refresh page
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(false)
      fill_field('textarea[name="response"]', 'Foo')
      @driver.find_element(:css, '.task__save').click
      media_pg.wait_all_elements(4, "annotations__list-item", :class)
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Foo or bar???')).to be(false)
      el = wait_for_selector('.task-actions__icon', :css)
      el.click
      media_pg.wait_all_elements(6, "annotations__list-item", :class)

      editbutton = wait_for_selector('.task-actions__edit', :css)
      editbutton.location_once_scrolled_into_view
      editbutton.click
      fill_field('#task-label-input', '??')
      sleep 5
      editbutton = wait_for_selector('.create-task__dialog-submit-button', :css)
      editbutton.click
      media_pg.wait_all_elements(8, "annotations__list-item", :class)
      sleep 10
      expect(@driver.page_source.include?('Foo or bar???')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(false)
      sleep 5
      el = wait_for_selector('.task-actions__icon', :css).click

      el = wait_for_selector('.task-actions__edit-response', :css)
      el.click

      # Ensure menu closes and textarea is focused...
      el = wait_for_selector('textarea[name="response"]', :css)
      el.click

      fill_field('textarea[name="response"]', ' edited')
      @driver.find_element(:css, '.task__save').click
      media_pg.wait_all_elements(9, 'annotations__list-item', :class)
      sleep 5
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
      el = wait_for_selector('.create-task__add-button', :css)
      el.click
      sleep 5
      el = wait_for_selector('create-task__add-choose-one', :class)
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input', :css)
      fill_field('#task-label-input', 'Foo or bar?')
      fill_field('0', 'Foo', :id)
      fill_field('1', 'Bar', :id)
      el = wait_for_selector('.create-task__dialog-submit-button', :css)
      el.click
      media_pg.wait_all_elements(2, "annotations__list-item", :class) #Wait for refresh page
      expect(@driver.page_source.include?('Foo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)
      # Answer task
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(false)
      el = wait_for_selector('0', :id)
      el.click
      el = wait_for_selector('task__submit', :class)
      el.click
      media_pg.wait_all_elements(4, "annotations__list-item", :class)
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(true)
      # Edit task
      expect(@driver.page_source.include?('Task edited by')).to be(false)
      el = wait_for_selector('.task-actions__icon', :css)
      el.click
      media_pg.wait_all_elements(6, "annotations__list-item", :class)
      editbutton = wait_for_selector('.task-actions__edit', :css)
      editbutton.location_once_scrolled_into_view
      editbutton.click
      fill_field('#task-label-input', '??')
      sleep 5
      editbutton = wait_for_selector('.create-task__dialog-submit-button', :css)
      editbutton.click
      media_pg.wait_all_elements(9, "annotations__list-item", :class)
      sleep 10
      expect(@driver.page_source.include?('Task edited by')).to be(true)
      # Edit task answer
      sleep 5
      el = wait_for_selector('.task-actions__icon', :css).click
      el = wait_for_selector('.task-actions__edit-response', :css)
      el.click
      el = wait_for_selector('1', :id)
      el.click
      el = wait_for_selector('task__submit', :class)
      el.click
      media_pg.wait_all_elements(10, "annotations__list-item", :class) #Wait for refresh page
      # Delete task
      delete_task('Foo')
    end

    it "should add, edit, answer, update answer and delete multiple_choice task", bin5: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')
      # Create a task
      expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      el = wait_for_selector('.create-task__add-button', :css)
      el.click
      sleep 5
      el = wait_for_selector('create-task__add-choose-multiple', :class)
      el.location_once_scrolled_into_view
      el.click
      wait_for_selector('#task-label-input', :css)
      fill_field('#task-label-input', 'Foo, Doo or bar?')
      fill_field('0', 'Foo', :id)
      fill_field('1', 'Bar', :id)
      el = wait_for_selector("//span[contains(text(), 'Add Option')]",:xpath)
      el.click
      fill_field('2', 'Doo', :id)
      el = wait_for_selector("//span[contains(text(), 'Add \"Other\"')]",:xpath)
      el.click
      el = wait_for_selector('.create-task__dialog-submit-button', :css)
      el.click
      media_pg.wait_all_elements(2, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)
      # Answer task
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(false)
      el = wait_for_selector('Foo', :id)
      el.click
      el = wait_for_selector('Doo', :id)
      el.click
      el = wait_for_selector('task__submit', :class)
      el.click
      media_pg.wait_all_elements(4, "annotations__list-item", :class)
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(true)
      # Edit task
      expect(@driver.page_source.include?('Task edited by')).to be(false)
      el = wait_for_selector('.task-actions__icon', :css)
      el.click
      media_pg.wait_all_elements(7, "annotations__list-item", :class)
      editbutton = wait_for_selector('.task-actions__edit', :css)
      editbutton.location_once_scrolled_into_view
      editbutton.click
      fill_field('#task-label-input', '??')
      sleep 5
      editbutton = wait_for_selector('.create-task__dialog-submit-button', :css)
      editbutton.click
      media_pg.wait_all_elements(8, "annotations__list-item", :class)
      sleep 10
      expect(@driver.page_source.include?('Task edited by')).to be(true)
      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(false)
      sleep 5
      el = wait_for_selector('.task-actions__icon', :css).click
      el = wait_for_selector('.task-actions__edit-response', :css)
      el.click
      el = wait_for_selector('Doo', :id)
      el.click
      el = wait_for_selector('.task__option_other_text_input')
      el.click
      fill_field('textarea[name="response"]', 'BooYaTribe')
      el = wait_for_selector('task__submit', :class)
      el.click
      media_pg.wait_all_elements(10, "annotations__list-item", :class) #Wait for refresh page
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(true)
      # Delete task
      delete_task('Foo')
    end

    it "should search for reverse images", bin2: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'https://www.instagram.com/p/BRYob0dA1SC/'
      wait_for_selector('.annotation__reverse-image')
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
      wait_for_selector("add-annotation", :class)
      title1 = @driver.title
      expect((title1 =~ /Random/).nil?).to be(false)
      el = wait_for_selector('.media-actions__icon')
      el.click
      sleep 1
      @driver.find_element(:css, '.media-actions__refresh').click
      sleep 10 #Needs to wait the refresh
      wait_for_selector("add-annotation", :class)
      title2 = @driver.title
      expect((title2 =~ /Random/).nil?).to be(false)
      expect(title1 != title2).to be(true)
    end

    it "should lock and unlock status", bin1: true do
      page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
      el = wait_for_selector('.media-actions__icon')
      el.click
      sleep 1
      @driver.find_element(:css, '.media-actions__lock-status').click
      sleep 10 #Needs to wait the refresh
      expect(@driver.page_source.include?('Item status locked by')).to be(true)
      el = wait_for_selector('.media-actions__icon')
      el.click
      sleep 1
      @driver.find_element(:css, '.media-actions__lock-status').click
      sleep 10 #Needs to wait the refresh
      expect(@driver.page_source.include?('Item status unlocked by')).to be(true)
    end

    it "should search by project", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector('.search-filter__project-chip').click
      sleep 10
      expect((@driver.current_url.to_s.match(/project/)).nil?).to be(false)
      expect((@driver.title =~ /Project/).nil?).to be(false)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector('.search-filter__project-chip').click
      sleep 10
      expect((@driver.title =~ /Project/).nil?).to be(true)
    end

    it "should search and change sort criteria", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)

      wait_for_selector("search__open-dialog-button", :id).click
      @driver.find_element(:xpath, "//span[contains(text(), 'Recent activity')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("search__open-dialog-button", :id).click
      @driver.find_element(:xpath, "//span[contains(text(), 'Created')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/recent_activity/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search and change sort order", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

      wait_for_selector("search__open-dialog-button", :id).click
      @driver.find_element(:xpath, "//span[contains(text(), 'Newest')]").click
      sleep 10
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("search__open-dialog-button", :id).click
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
      wait_for_selector("search__open-dialog-button", :id).click
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected')
      expect(selected.size == 3).to be(true)
    end

    it "should change search sort criteria through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort"%3A"recent_activity"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Recent activity', 'Newest first', 'Media'].sort).to be(true)
    end

    it "should change search sort order through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"sort_type"%3A"ASC"%7D'
      sleep 10
      expect(@driver.page_source.include?('My search result')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
      expect(selected == ['Created', 'Oldest first', 'Media'].sort).to be(true)
    end

    it "should not reset password", bin5: true do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      sleep 2
      expect(@driver.page_source.include?('email was not found')).to be(true)
      expect(@driver.page_source.include?('Password reset sent')).to be(false)
    end

    it "should reset password", bin5: true do
      user = api_create_and_confirm_user
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password(user.email)
      sleep 2
      expect(@driver.page_source.include?('email was not found')).to be(false)
      expect(@driver.page_source.include?('Password reset sent')).to be(true)
    end

    it "should set metatags", bin5: true do
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

    it "should embed bli", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      sleep 2
      request_api('make_team_public', { slug: get_team })

      @driver.navigate.refresh
      sleep 5
      wait_for_selector('.media-actions__icon').click
      sleep 1
      expect(@driver.page_source.include?('Embed')).to be(true)
      url = @driver.current_url.to_s
      wait_for_selector('.media-actions__embed').click
      sleep 2
      expect(@driver.current_url.to_s == "#{url}/embed").to be(true)
      expect(@driver.page_source.include?('Not available')).to be(false)
      @driver.find_elements(:css, 'body').map(&:click)
      sleep 1
      el = wait_for_selector('#media-embed__actions-copy')
      el.click
      sleep 1
      @driver.navigate.to 'https://paste.ubuntu.com/'
      el = wait_for_selector('#id_content')
      el.send_keys(' ')
      @driver.action.send_keys(:control, 'v').perform
      sleep 1
      expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
      sleep 5
    end

    it "should paginate project page", bin2: true do
      page = api_create_team_project_claims_sources_and_redirect_to_project_page 21
      page.load
      sleep 3
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//span[contains(text(), 'Sources')]", :xpath, 100).click
      wait_for_selector("source-card", :class)
      results = @driver.find_elements(:css, '.medias__item')
      expect(results.size == 40).to be(true)
      old = results.size
      results.last.location_once_scrolled_into_view
      size = wait_for_size_change(old, '.medias__item')
      expect(size == 42).to be(true)
    end

    it "should show teams at /check/teams", bin1: true do
      api_create_team
      @driver.navigate.to @config['self_url'] + '/check/teams'
      wait_for_selector("teams", :class)
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should add, edit, answer, update answer and delete geolocation task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(false)
      expect(@driver.page_source.include?('Task created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      sleep 5
      el = wait_for_selector('.create-task__add-geolocation')
      el.click
      sleep 1
      fill_field('#task-label-input', 'Where?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)

      # Answer task
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(false)
      fill_field('textarea[name="response"]', 'Salvador')
      fill_field('#task__response-geolocation-coordinates', '-12.9015866, -38.560239')
      el = wait_for_selector('.task__save')
      el.click
      wait_for_selector('.annotation--task_response_geolocation')
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('class="task task__answered-by-current-user"')).to be(true)

      # Edit task
      expect(@driver.page_source.include?('Where was it?')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      sleep 1
      el = wait_for_selector('.task-actions__edit')
      el.click
      sleep 1
      update_field('#task-label-input', 'Where was it?')
      el = wait_for_selector( '.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where was it?')).to be(true)

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(false)
      el = wait_for_selector('.task-actions__icon')
      el.click
      sleep 1
      el = wait_for_selector('.task-actions__edit-response')
      el.click
      sleep 1
      update_field('textarea[name="response"]', 'Vancouver')
      update_field('#task__response-geolocation-coordinates', '49.2577142, -123.1941156')
      el = wait_for_selector('.task__save')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(true)

      # Delete task
      delete_task('Where was it')
    end

    it "should add image to media comment", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      # First, verify that there isn't any comment with image
      expect(@driver.page_source.include?('This is my comment with image')).to be(false)

      old = @driver.find_elements(:class, "annotations__list-item").length
      # Add a comment as a command
      fill_field('#cmd-input', 'This is my comment with image')
      el = wait_for_selector('.add-annotation__insert-photo')
      el.click
      wait_for_selector('input[type=file]')
      input = wait_for_selector('input[type=file]')
      input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      el = wait_for_selector('.add-annotation__buttons button')
      el.click
      wait_for_size_change(old, "annotations__list-item", :class)

      # Verify that comment was added to annotations list
      expect(@driver.page_source.include?('This is my comment with image')).to be(true)
      imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)

      # Zoom image
      expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)
      el = wait_for_selector('.annotation__card-thumbnail')
      el.click

      wait_for_selector('.ril-close')
      expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(false)
      @driver.action.send_keys(:escape).perform
      @wait.until {@driver.find_elements(:css, '.ril-close').length == 0 }
      expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)

      # Reload the page and verify that comment is still there
      @driver.navigate.refresh
      wait_for_selector('add-annotation__buttons', :class)
      expect(@driver.page_source.include?('This is my comment with image')).to be(true)
      imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
      expect(imgsrc.match(/test\.png$/).nil?).to be(false)
    end

    it "should delete annotation from annotations list (for media and source)", bin5: true do
      #source
      api_create_team_project_and_source_and_redirect_to_source('Megadeth', 'https://twitter.com/megadeth')
      wait_for_selector(".source__tab-button-account")
      el = wait_for_selector(".source__tab-button-notes")
      el.click
      expect(@driver.page_source.include?('Note added')).to be(false)
      old = wait_for_selector_list("annotation__default-content",:class).length
      fill_field('textarea[name="cmd"]', 'Test')
      el = wait_for_selector(".add-annotation button[type=submit]")
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('Note added')).to be(true)
      expect(@driver.page_source.include?('Comment deleted by')).to be(false)
      el = wait_for_selector('.menu-button')
      el.click
      el = wait_for_selector('.annotation__delete')
      el.click
      wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('Comment deleted by')).to be(true)

      #media
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('Note added')).to be(false)
      old = wait_for_selector_list("annotation__default-content", :class).length
      fill_field('textarea[name="cmd"]', 'Test')
      el = wait_for_selector(".add-annotation button[type=submit]")
      el.click
      old = wait_for_size_change(old, "annotation__default-content", :class)
      sleep 10
      expect(@driver.page_source.include?('Note added')).to be(true)
      expect(@driver.page_source.include?('Comment deleted by')).to be(false)
      el = wait_for_selector('.menu-button')
      el.click
      el = wait_for_selector('.annotation__delete')
      el.click
      wait_for_size_change(old, "annotation__default-content", :class)
      expect(@driver.page_source.include?('Comment deleted by')).to be(true)
    end

    it "should upload image when registering", bin3: true do
      email, password, avatar = ["test-#{Time.now.to_i}@example.com", '12345678', File.join(File.dirname(__FILE__), 'test.png')]
      page = LoginPage.new(config: @config, driver: @driver).load
             .register_and_login_with_email(email: email, password: password, file: avatar)
      me_page = MePage.new(config: @config, driver: page.driver).load
      sleep 2 #for load
      wait_for_selector('.user-menu__edit-profile-button')
      script = "return window.getComputedStyle(document.getElementsByClassName('source__avatar')[0]).getPropertyValue('background-image')"
      avatar = @driver.execute_script(script)
      expect(avatar.include?('test.png')).to be(true)
    end

    it "should create claim", bin3: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
      sleep 5
      wait_for_selector("create-media__add-item", :id).click
      wait_for_selector('create-media__quote', :id).click
      sleep 1
      @driver.action.send_keys('Test').perform
      expect((@driver.current_url.to_s =~ /media/).nil?).to be(true)
      @driver.action.send_keys(:enter).perform
      # press_button('#create-media-submit')
      sleep 5
      wait_for_selector('.media-detail__check-timestamp').click
      expect((@driver.current_url.to_s =~ /media/).nil?).to be(false)
    end

    it "should redirect to last visited project", bin3: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      sleep 1
      api_create_team_and_project(user: user)

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      sleep 3
      link = wait_for_selector_list('.teams a').first
      link.click
      link = wait_for_selector('.team__project-title')
      sleep 2
      link.click
      sleep 5

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      link = wait_for_selector_list('.teams a').last
      sleep 2
      link.click
      sleep 5

      @driver.navigate.to(@config['self_url'])
      sleep 10
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
      el = wait_for_selector('.find-team__submit-button', :css)
      el.click
      sleep 1
      wait_for_selector('.find-team-card')
      expect(@driver.page_source.include?('Team not found!')).to be(true)

      # redirect to /team-slug/join if team exists
      # /team-slug/join in turn redirects to team page because already member
      page = CreateTeamPage.new(config: @config, driver: @driver).load
      page.create_team({ name: 'Existing Team', slug: 'existing-slug' })

      @driver.navigate.to @config['self_url'] + '/check/teams/find'
      el = wait_for_selector('.find-team__submit-button', :css)
      fill_field('#team-slug-container', 'existing-slug')
      el.click
      sleep 1
      wait_for_selector('.team__primary-info')
      expect(@driver.page_source.include?('Existing Team')).to be(true)
    end

    it "should manage related items", bin5: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-related-media__add-button')
      expect(@driver.page_source.include?('Child Claim')).to be(false)
      press_button('.create-related-media__add-button')
      wait_for_selector('#create-media__quote').click
      fill_field('#create-media-quote-input', 'Child Claim')
      sleep 1
      fill_field('#create-media-quote-attribution-source-input', 'Child Claim Source')
      sleep 1
      press_button('#create-media-dialog__submit-button')
      sleep 5
      expect(@driver.page_source.include?('Child Claim')).to be(true)
      wait_for_selector('.project-header__back-button').click
      expand = wait_for_selector('.card-with-border > div > div > div + button')
      expect(@driver.page_source.include?('Child Claim')).to be(false)
      expect(@driver.page_source.include?('1 related')).to be(false)
      expand.click
      sleep 5
      expect(@driver.page_source.include?('Child Claim')).to be(true)
      expect(@driver.page_source.include?('1 related')).to be(true)
      sleep 5
    end

    it "should search map in geolocation task", bin3: true do
      media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.create-task__add-button')

      # Create a task
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(false)
      expect(@driver.page_source.include?('Task "Where?" created by')).to be(false)
      el = wait_for_selector('.create-task__add-button')
      el.click
      sleep 5
      el = wait_for_selector('.create-task__add-geolocation')
      el.click
      sleep 1
      fill_field('#task-label-input', 'Where?')
      el = wait_for_selector('.create-task__dialog-submit-button')
      el.click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where?')).to be(true)

      # Search map
      expect(@driver.page_source.include?('SSA')).to be(false)
      fill_field("geolocationsearch", "Salvador", :id)
      sleep 5
      expect(@driver.page_source.include?('SSA')).to be(true)
    end

    it "should install and uninstall bot", bin6: true do
      # Create team, bot and go to team page
      api_create_bot
      team = "testteam#{Time.now.to_i}"
      api_create_team(team: team)
      p = Page.new(config: @config, driver: @driver)
      p.go(@config['self_url'] + '/' + team)

      # No bots on team page
      wait_for_selector('.team-menu__team-settings-button').click ; sleep 5
      wait_for_selector('.team-settings__bots-tab').click ; sleep 5
      expect(@driver.page_source.include?('No bots installed')).to be(true)
      expect(@driver.page_source.include?('Testing Bot')).to be(false)

      # Install bot
      wait_for_selector('.team > div + div button').click ; sleep 5
      expect(@driver.page_source.include?('Bot Garden')).to be(true)
      wait_for_selector('h2 + div > div + div + div + div .bot-garden__bot-name').click ; sleep 5
      wait_for_selector('input').click ; sleep 1
      @driver.switch_to.alert.accept ; sleep 5

      # Bot on team page
      p.go(@config['self_url'] + '/' + team)
      wait_for_selector('.team-menu__team-settings-button').click ; sleep 5
      wait_for_selector('.team-settings__bots-tab').click ; sleep 5
      expect(@driver.page_source.include?('No bots installed')).to be(false)
      expect(@driver.page_source.include?('Testing Bot')).to be(true)

      # Uninstall bot
      wait_for_selector('input').click ; sleep 1
      @driver.switch_to.alert.accept ; sleep 5
      expect(@driver.page_source.include?('No bots installed')).to be(true)
      expect(@driver.page_source.include?('Testing Bot')).to be(false)
    end

    it "should assign project", bin3: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      @driver.navigate.to(@config['self_url'] + '/check/me')
      wait_for_selector('#teams-tab').click
      wait_for_selector('.teams a').click
      wait_for_selector('.team__project-title')
      expect(@driver.page_source.include?('Not assigned to any member')).to be(true)
      expect(@driver.page_source.include?('Assigned to one member')).to be(false)
      ['.team__project button', '.project__assignment-button', '.project__assignment-menu input[type=checkbox]', '.multi__selector-save'].each do |selector|
        wait_for_selector(selector).click
      end
      sleep 10
      expect(@driver.page_source.include?('Not assigned to any member')).to be(false)
      expect(@driver.page_source.include?('Assigned to one member')).to be(true)
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
