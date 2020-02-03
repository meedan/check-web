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
require_relative './media_spec.rb'
# require_relative './source_spec.rb'

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
    it_behaves_like "media", 'BELONGS_TO_ONE_PROJECT'
    it_behaves_like "media", 'DOES_NOT_BELONG_TO_ANY_PROJECT'

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
      expect(@driver.page_source.include?('No default tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetag')).to be(false)

      # Create tag
      fill_field('#tag__new', 'newteamwidetag')
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#tag__text-newteamwidetag")
      expect(@driver.page_source.include?('No default tags')).to be(false)
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
      expect(@driver.page_source.include?('No default tags')).to be(false)
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
      expect(@driver.page_source.include?('No default tags')).to be(true)
      expect(@driver.page_source.include?('No custom tags')).to be(true)
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newteamwidetagedited')).to be(false)
    end

    it "should redirect to access denied page", bin1: true do
      user = api_register_and_login_with_email
      api_logout
      api_register_and_login_with_email
      me_pg = MePage.new(config: @config, driver: @driver).load
      wait_for_selector("#teams-tab").click;
      wait_for_selector("//span[contains(text(), 'Create Workspace')]", :xpath)
      expect(@driver.page_source.include?('Access Denied')).to be(false)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(true)
      unauthorized_pg = SourcePage.new(id: user.dbid, config: @config, driver: @driver).load
      wait_for_selector(".main-title")
      expect(@driver.page_source.include?('Access Denied')).to be(true)
      expect((@driver.current_url.to_s =~ /\/forbidden$/).nil?).to be(false)
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

    it "should display a default title for new media", bin1: true, quick:true do
      api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/TheWho/status/890135323216367616')
      wait_for_selector(".media-detail")
      wait_for_selector("iframe")
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
      wait_for_selector('.project-header__back-button').click
      wait_for_selector('.medias__item')
      expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)

      # YouTube
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
      wait_for_selector(".media-detail")
      wait_for_selector("iframe")
      expect(@driver.page_source.include?("How To Check An Account's Authenticity")).to be(true)
      wait_for_selector('.project-header__back-button').click
      wait_for_selector('.medias__item')
      expect(@driver.page_source.include?("How To Check An Account's Authenticity")).to be(true)

      # Facebook
      media_pg = api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
      wait_for_selector(".media-detail")
      wait_for_selector("iframe")
      expect(@driver.page_source.include?("First Draft")).to be(true)
      wait_for_selector('.project-header__back-button').click
      wait_for_selector('.medias__item')
      expect(@driver.page_source.include?("First Draft")).to be(true)
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
      # api_create_team_project_and_link('https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)
      expect(page.contains_string?('This is a test')).to be(false)

      page.create_media(input: 'https://twitter.com/marcouza/status/771009514732650497?t=' + Time.now.to_i.to_s)

      @driver.navigate.to @config['self_url']
      wait_for_selector('.medias__item')

      expect(page.contains_string?('This is a test')).to be(true)
    end

    it "should search for image",  bin2: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))
      wait_for_selector(".add-annotation__buttons")
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items'
      wait_for_selector(".search__results-heading")
      wait_for_selector('.medias__item')
      expect(@driver.page_source.include?('test.png')).to be(true)

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

    it "should autorefresh project when media is created", bin1: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      url = @driver.current_url
      wait_for_selector('#search__open-dialog-button')
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      wait_for_selector("#search-input")
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
      wait_for_selector_list_size(".medias__item", 1, :css , 80)
      @wait.until { (@driver.page_source.include?('Auto-Refresh')) }
      result = @driver.find_elements(:css, '.media__heading')
      expect(result.size == 1).to be(true)
      expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
    end

    it "should autorefresh media when annotation is created", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      url = @driver.current_url
      wait_for_selector(".media-detail")
      expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
      current_window = @driver.window_handles.last
      @driver.execute_script("window.open('#{url}')")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector(".media-tab__comments").click
      fill_field('#cmd-input', 'Auto-Refresh')
      @driver.action.send_keys(:enter).perform
      wait_for_selector(".annotations__list-item")
      @driver.execute_script('window.close()')
      @driver.switch_to.window(current_window)
      wait_for_selector(".media-tab__comments").click
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
      wait_for_selector(".team-menu__edit-team-button")
      expect(page.team_name).to eq(t1.name)
      page = MePage.new(config: @config, driver: @driver).load
          .select_team(name: t2.name)
      wait_for_selector(".team-menu__edit-team-button")
      expect(page.team_name).to eq(t2.name)
    end

    it "should linkify URLs on comments", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(false)
      wait_for_selector(".media-tab__comments").click
      fill_field('#cmd-input', 'https://meedan.com/en/')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.annotation__avatar-col')
      old = wait_for_size_change(0, 'annotation__card-content', :class, 25)
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(true)
      el = wait_for_selector_list("//a[contains(text(), 'https://meedan.com/en/')]", :xpath)
      expect(el.length == 1).to be(true)
    end

    it "should find all medias with an empty search", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector(".media-detail")
      wait_for_selector(".project-header__back-button").click
      wait_for_selector("#search__open-dialog-button")
      old = wait_for_selector_list(".medias__item").length
      el = wait_for_selector("#search-input")
      el.click
      @driver.action.send_keys(:enter).perform
      current = wait_for_selector_list(".medias__item").length
      expect(old == current).to be(true)
      expect(current > 0).to be(true)
    end

    it "should search in trash page", bin4: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector(".media-detail")
      wait_for_selector('.media-actions__icon').click
      wait_for_selector(".media-actions__send-to-trash").click
      wait_for_selector(".message")
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/trash'
      wait_for_selector(".medias__item")
      trash_button = wait_for_selector('.trash__empty-trash-button')
      expect(trash_button.nil?).to be(false)
      expect(@driver.page_source.include?('Claim')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//div[contains(text(), 'In Progress')]",:xpath).click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__submit-button")
      expect(@driver.page_source.include?('Claim')).to be(false)
    end

    # it "should find medias when searching by keyword", bin2: true do
    #   api_create_team_project_and_link('https://www.facebook.com/permalink.php?story_fbid=10155901893214439&id=54421674438')
    #   @driver.navigate.to @config['self_url']
    #   wait_for_selector_list_size('.medias__item', 1)
    #   create_media("https://twitter.com/TwitterVideo/status/931930009450795009")
    #   wait_for_selector_list_size('.medias__item', 2)
    #   wait_for_selector("//span[contains(text(), '1 - 2 / 2')]",:xpath)
    #   expect(@driver.page_source.include?('on Facebook')).to be(true)
    #   expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
    #   el = wait_for_selector("#search-input")
    #   el.send_keys "video"
    #   @driver.action.send_keys(:enter).perform
    #   wait_for_selector_list_size('.medias__item', 1)
    #   wait_for_selector("//span[contains(text(), '1 / 1')]",:xpath)
    #   expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(true)
    #   expect(@driver.page_source.include?('on Facebook')).to be(false)
    #   wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    #   wait_for_selector("#search-input").send_keys "meedan"
    #   @driver.action.send_keys(:enter).perform
    #   wait_for_selector_list_size('.medias__item', 1)
    #   wait_for_selector("//span[contains(text(), '1 / 1')]",:xpath)
    #   expect(@driver.page_source.include?('on Facebook')).to be(true)
    #   expect(@driver.page_source.include?('weekly @Twitter video recap')).to be(false)
    # end

    it "should search for reverse images", bin2: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'https://www.instagram.com/p/BRYob0dA1SC/'
      card = wait_for_selector_list(".media-detail").length
      expect(card == 1).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      wait_for_selector(".media-detail__reverse-image-search > button").click
      wait_for_selector("#top_nav")
      @driver.switch_to.window(@driver.window_handles.last)
      wait_for_selector(".create-task__add-button")
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    # it "should refresh media", bin1: true do
    #   page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
    #   wait_for_selector(".media-detail")
    #   title1 = @driver.title
    #   expect((title1 =~ /Random/).nil?).to be(false)
    #   el = wait_for_selector('.media-actions__icon')
    #   el.click
    #   wait_for_selector(".media-actions__edit")
    #   @driver.find_element(:css, '.media-actions__refresh').click
    #   wait_for_selector_none(".media-actions__edit")
    #   wait_for_text_change(title1,"title", :css, 30)
    #   title2 = @driver.title
    #   expect((title2 =~ /Random/).nil?).to be(false)
    #   expect(title1 == title2).to be(true)
    # end

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
      api_create_team_project_and_claim_and_redirect_to_media_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"projects"%3A%5B0%5D%7D'
      wait_for_selector(".search__results-heading")
      expect(@driver.page_source.include?('My search result')).to be(false)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-input")
      selected = @driver.find_elements(:css, '.search-query__filter-button--selected')
      expect(selected.size == 2).to be(true)
    end

    it "should search by date range", bin4: true do
      api_create_claim_and_go_to_search_page
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(true)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D'
      expect(@driver.page_source.include?('Claim')).to be(false)

      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".date-range__start-date input").click
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector(".date-range__end-date input").click
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(false)
    end

    it "should change search sort criteria through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__related")
      expect(el.find_element(:css, "svg.list-header__sort-desc").nil?).to be(false)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"requests"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__requests")
      expect(el.find_element(:css, "svg.list-header__sort-desc").nil?).to be(false)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"recent_added"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__recent_added")
      expect(el.find_element(:css, "svg.list-header__sort-desc").nil?).to be(false)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"last_seen"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__last_seen")
      expect(el.find_element(:css, "svg.list-header__sort-desc").nil?).to be(false)
    end

    it "should change search sort order through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__related")
      expect(el.find_element(:css, "svg.list-header__sort-desc").nil?).to be(false)

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"requests"%2C"sort_type"%3A"ASC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("#list-header__requests")
      expect(el.find_element(:css, "svg.list-header__sort-asc").nil?).to be(false)
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
      page = api_create_team_project_claims_sources_and_redirect_to_project_page 21, 0
      page.load
      wait_for_selector('.media__heading')
      wait_for_selector(".search__results-heading")
      expect(@driver.page_source.include?('1 - 20 / 21')).to be(true)
      wait_for_selector(".search__next-page").click
      wait_for_selector('.media__heading')
      wait_for_selector(".search__results-heading")
      expect(@driver.page_source.include?('21 - 21 / 21')).to be(true)
    end

    it "should show teams at /check/teams", bin1: true do
      api_create_team
      @driver.navigate.to @config['self_url'] + '/check/teams'
      wait_for_selector("teams", :class)
      expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
    end

    it "should add, edit, answer, update answer and delete geolocation task", bin3: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.media-detail')

      # Create a task
      wait_for_selector(".media-tab__activity").click
      old = @driver.find_elements(:class, "annotations__list-item").length
      wait_for_selector(".media-tab__tasks").click
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
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where?')).to be(true)
      expect(@driver.page_source.include?('Task created by')).to be(true)
      wait_for_selector(".media-tab__tasks").click
      wait_for_selector('.task-type__geolocation > div > div > button').click

      # Answer task
      expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
      fill_field('textarea[name="response"]', 'Salvador')
      fill_field('#task__response-geolocation-coordinates', '-12.9015866, -38.560239')
      el = wait_for_selector('.task__save')
      el.click
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Task answered by')).to be(true)
      wait_for_selector(".media-tab__tasks").click
      wait_for_selector('.task-type__geolocation > div > div > button').click


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
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where was it?')).to be(true)
      wait_for_selector(".media-tab__tasks").click
      wait_for_selector('.task-type__geolocation > div > div > button').click

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
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(true)
      wait_for_selector(".media-tab__tasks").click

      # Delete task
      wait_for_selector('.task-type__geolocation > div > div > button').click
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
      wait_for_selector(".medias__item")
      wait_for_selector(".media__heading").click
      wait_for_selector(".media-detail")
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
      wait_for_selector(".team-header__drawer-team-link").click
      link = wait_for_selector('.team__project-title')
      link.click
      wait_for_selector_none(".team-members__edit-button")

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      wait_for_selector(".switch-teams__joined-team")
      link = wait_for_selector_list('.teams a').last
      link.click
      wait_for_selector(".team-header__drawer-team-link").click
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
      expect(@driver.page_source.include?('Find an existing workspace')).to be(true)

      # return error for non existing team
      fill_field('#team-slug-container', 'non-existing-slug')
      el = wait_for_selector('.find-team__submit-button')
      el.click
      wait_for_selector('.find-team-card')
      expect(@driver.page_source.include?('Workspace not found!')).to be(true)

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
      wait_for_selector('.media-detail')

      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      wait_for_selector(".media-tab__tasks").click

      # Create a task
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
      wait_for_selector(".media-tab__activity").click
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(true)

      # Search map
      wait_for_selector(".media-tab__tasks").click
      expect(@driver.page_source.include?('Salvador, Microrregião de Salvador, Brazil')).to be(false)
      wait_for_selector('.task-type__geolocation > div > div > button').click
      wait_for_selector("#task__response-geolocation-name")
      fill_field("#geolocationsearch", "Salvador")
      wait_for_selector(".task__response-geolocation-search-options")
      dropdown = @driver.find_element(:id,'geolocationsearch')
      dropdown.send_keys(:arrow_down)
      dropdown.send_keys(:arrow_down)
      @driver.action.send_keys(:enter).perform
      wait_for_text_change(' ',"#task__response-geolocation-name")
      expect(@driver.page_source.include?('Salvador, Microrregião de Salvador, Brazil')).to be(true)
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
