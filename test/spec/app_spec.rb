require 'selenium-webdriver'
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
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newtag')).to be(false)

      # Create tag
      fill_field('#tag__new', 'newtag')
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#tag__text-newtag")
      expect(@driver.page_source.include?('No tags')).to be(false)
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newtag')).to be(true)
      expect(@driver.page_source.include?('newtagedited')).to be(false)

      # Edit tag
      wait_for_selector('.tag__actions').click
      wait_for_selector(".tag__delete")
      wait_for_selector('.tag__edit').click
      wait_for_selector("#tag__edit")
      fill_field('#tag__edit', 'edited')
      @driver.action.send_keys(:enter).perform
      wait_for_selector("#tag__text-newtagedited")
      expect(@driver.page_source.include?('1 tag')).to be(true)
      expect(@driver.page_source.include?('newtagedited')).to be(true)

      # Delete tag
      wait_for_selector('.tag__actions').click
      wait_for_selector('.tag__edit')
      wait_for_selector('.tag__delete').click
      wait_for_selector('#confirm-dialog__checkbox').click
      wait_for_selector('#confirm-dialog__confirm-action-button').click
      wait_for_selector_none('#tag__confirm')
      wait_for_selector_none("#tag__text-newtagedited")
      expect(@driver.page_source.include?('No tags')).to be(true)
      expect(@driver.page_source.include?('newtagedited')).to be(false)
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
      caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'fr' } })
      driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
      driver.navigate.to @config['self_url']
      @wait.until { driver.find_element(:id, "register") }
      expect(driver.find_element(:css, '.login__heading span').text == 'Connexion').to be(true)
      driver.quit

      caps = Selenium::WebDriver::Remote::Capabilities.chrome(chromeOptions: { prefs: { 'intl.accept_languages' => 'pt' } })
      driver = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: caps)
      driver.navigate.to @config['self_url']
      @wait.until { driver.find_element(:id, "register") }
      expect(driver.find_element(:css, '.login__heading span').text == 'Entrar').to be(true)
      driver.quit
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

    it "should search for image",  bin2: true do
      api_create_team_and_project
      page = ProjectPage.new(config: @config, driver: @driver).load
             .create_image_media(File.join(File.dirname(__FILE__), 'test.png'))
      wait_for_selector(".create-related-media__add-button")
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
      url = 'https://twitter.com/meedan/status/1262644257996898305'
      api_create_team_project_and_link_and_redirect_to_media_page url
      id1 = @driver.current_url.to_s.gsub(/^.*\/media\//, '').to_i
      expect(id1 > 0).to be(true)
      wait_for_selector("#media-actions-bar__add-to")
      wait_for_selector(".project-header__back-button").click
      wait_for_selector(".medias__item")
      wait_for_selector("#create-media__add-item").click
      wait_for_selector("#create-media__link")
      fill_field('#create-media-input', url)
      wait_for_selector('#create-media-dialog__submit-button').click
      wait_for_selector(".create-related-media__add-button")
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
      wait_for_selector("#search-form")
      l = wait_for_selector_list('.project-actions')
      expect(l.length == 1).to be(true)

      page.go(@config['api_path'] + '/test/session?email='+utp[:user2]["email"])
      page.go(@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
      wait_for_selector("#search-form")
      wait_for_selector_none('.project-actions')
      expect(@driver.find_elements(:class, "project-actions").length == 0).to be(true)
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
      wait_for_selector(".source__primary-info")
      page.select_team(name: t1.name)
      wait_for_selector(".team-menu__edit-team-button")
      team_name = wait_for_selector('.team__name').text
      expect(team_name).to eq(t1.name)
      @driver.navigate.to(@config['self_url'] + '/check/me')
      wait_for_selector(".source__primary-info")
      page.select_team(name: t2.name)
      wait_for_selector(".team-menu__edit-team-button")
      team_name = wait_for_selector('.team__name').text
      expect(team_name).to eq(t2.name)
    end

    it "should linkify URLs on comments", bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(false)
      wait_for_selector(".media-tab__comments").click
      fill_field('#cmd-input', 'https://meedan.com/en/')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.annotation__avatar-col')
      wait_for_size_change(0, 'annotation__card-content', :class, 25)
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

#search section start
    it "should search in trash page", bin4: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector(".media-detail")
      wait_for_selector('.media-actions__icon').click
      wait_for_selector(".media-actions__send-to-trash").click
      wait_for_selector(".message")
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/trash'
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('Claim')).to be(true)
      wait_for_selector("search__open-dialog-button", :id).click
      wait_for_selector("//div[contains(text(), 'In Progress')]",:xpath).click
      wait_for_selector("#search-query__submit-button").click
      wait_for_selector_none("#search-query__submit-button")
      expect(@driver.page_source.include?('Claim')).to be(false)
    end

    it "should search for reverse images", bin2: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'https://twitter.com/meedan/status/1167366036791943168'
      card = wait_for_selector_list(".media-detail").length
      expect(card == 1).to be(true)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
      current_window = @driver.window_handles.last
      wait_for_selector(".media-detail__reverse-image-search > button").click
      @driver.switch_to.window(@driver.window_handles.last)
      expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
      @driver.switch_to.window(current_window)
    end

    it "should refresh media", bin1: true do
      api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
      wait_for_selector(".media-detail")
      title1 = @driver.title
      expect((title1 =~ /Random/).nil?).to be(false)
      el = wait_for_selector('.media-actions__icon')
      el.click
      wait_for_selector(".media-actions__edit")
      @driver.find_element(:css, '.media-actions__refresh').click
      wait_for_selector_none(".media-actions__edit")
      wait_for_text_change(title1,"title", :css)
      @wait.until { (@driver.title != title1) }
      title2 = @driver.title
      expect((title2 =~ /Random/).nil?).to be(false)
      expect(title1 != title2).to be(true)
    end

    it "should search and change sort criteria", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/related/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)

      wait_for_selector("th[data-field=related_count] span").click
      wait_for_selector(".medias__item")
      expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/related/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("th[data-field=created_at] span").click
      wait_for_selector(".medias__item")
      expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/related/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search and change sort order", bin2: true do
      api_create_claim_and_go_to_search_page
      expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

      wait_for_selector("th[data-field=related_count]").click
      wait_for_selector(".medias__item")
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
      expect(@driver.page_source.include?('My search result')).to be(true)

      wait_for_selector("th[data-field=related_count]").click
      wait_for_selector(".medias__item")
      expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(true)
      expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(false)
      expect(@driver.page_source.include?('My search result')).to be(true)
    end

    it "should search by project through URL", bin2: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"projects"%3A%5B' + get_project + '%5D%7D'
      wait_for_selector(".search__results-heading")
      expect(@driver.page_source.include?('My search result')).to be(false)
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-query__cancel-button")
      selected = @driver.find_elements(:css, '.search-filter__project-chip--selected')
      expect(selected.size == 1).to be(true)
    end

    it "should search by date range", bin4: true do
      api_create_claim_and_go_to_search_page
      wait_for_selector(".medias__item")
      expect(@driver.page_source.include?('My search result')).to be(true)

      # Pre-populate dates to force the date picker to open at certain calendar months.
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D'
      wait_for_selector_none(".medias__item", :css, 10)
      expect(@driver.page_source.include?('My search result')).to be(false)

      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector(".date-range__start-date input").click

      # The date picker is broken: https://github.com/mui-org/material-ui-pickers/issues/1526
      # The upshot: open it with value=2016-01-01, click "OK", and it will return a different
      # date. That's why we can submit the form even though it looks like this test isn't
      # changing any values.
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector_none("body>div[role=dialog]")  # wait for mui-picker background to fade away
      wait_for_selector(".date-range__end-date input").click
      wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
      wait_for_selector_none("body>div[role=dialog]")  # wait for mui-picker background to fade away
      wait_for_selector("#search-query__submit-button:not(:disabled)").click
      wait_for_selector_none(".medias__item",:css, 10)
      expect(@driver.page_source.include?('My search result')).to be(false)
    end

    it "should change search sort criteria through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("th[data-field=related_count][aria-sort]")
      expect(el).to be  # TODO nix this line after https://mantis.meedan.com/view.php?id=8221

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"recent_added"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("th[data-field=created_at][aria-sort]")
      expect(el).to be  # TODO nix this line after https://mantis.meedan.com/view.php?id=8221
    end

    it "should change search sort order through URL", bin2: true do
      api_create_claim_and_go_to_search_page
      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"DESC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("th[data-field=related_count][aria-sort=descending]")
      expect(el).to be  # TODO nix this line after https://mantis.meedan.com/view.php?id=8221

      @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"ASC"%7D'
      wait_for_selector("#create-media__add-item")
      expect(@driver.page_source.include?('My search result')).to be(true)
      el = wait_for_selector("th[data-field=related_count][aria-sort=ascending]")
      expect(el).to be  # TODO nix this line after https://mantis.meedan.com/view.php?id=8221
    end
#search section end

    it "should not reset password", bin5: true do
      page = LoginPage.new(config: @config, driver: @driver)
      page.reset_password('test@meedan.com')
      wait_for_selector(".user-password-reset__email-input")
      wait_for_selector("#password-reset-email-input-helper-text")
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
      wait_for_selector('.create-task__add-button').click
      wait_for_selector('.create-task__add-geolocation').click
      wait_for_selector("#task-description-input" )
      fill_field('#task-label-input', 'Where?')
      wait_for_selector('.create-task__dialog-submit-button').click
      wait_for_selector_none("#task-label-input")
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
      wait_for_selector('.task__save').click
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Task completed by')).to be(true)
      wait_for_selector(".media-tab__tasks").click
      wait_for_selector('.task-type__geolocation > div > div > button').click


      # Edit task
      expect(@driver.page_source.include?('Where was it?')).to be(false)
      wait_for_selector('.task-actions__icon').click
      wait_for_selector('.task-actions__edit').click
      wait_for_selector("#task-description-input" )
      update_field('#task-label-input', 'Where was it?')
      wait_for_selector( '.create-task__dialog-submit-button').click
      wait_for_selector_none("#task-description-input")
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.include?('Where was it?')).to be(true)
      wait_for_selector(".media-tab__tasks").click
      wait_for_selector('.task-type__geolocation > div > div > button').click

      # Edit task answer
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(false)
      wait_for_selector('.task-actions__icon').click
      wait_for_selector('.task-actions__edit-response').click
      wait_for_selector(".task__cancel")
      update_field('textarea[name="response"]', 'Vancouver')
      update_field('#task__response-geolocation-coordinates', '49.2577142, -123.1941156')
      wait_for_selector('.task__save').click
      wait_for_selector(".media-tab__activity").click
      old = wait_for_size_change(old, "annotations__list-item", :class)
      expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Vancouver')).to be(true)
      wait_for_selector(".media-tab__tasks").click

      # Delete task
      wait_for_selector('.task-type__geolocation > div > div > button').click
      delete_task('Where was it')
    end

    it "should upload image when registering", bin3: true do
      @driver.navigate.to @config['self_url']
      wait_for_selector(".login__form")
      wait_for_selector("#register").click
      wait_for_selector(".without-file")
      fill_field('.login__name input', 'User With Email')
      fill_field('.login__email input', @email)
      fill_field('.login__password input', '12345678')
      fill_field('.login__password-confirmation input', '12345678')
      wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
      wait_for_selector(".with-file")
      expect(wait_for_selector(".with-file div").text.include?('test.png')).to be(true)
      agree_to_tos(false)
      press_button('#submit-register-or-login')
      wait_for_selector(".message")
      expect(@driver.page_source.include?('Please check your email to verify your account')).to be(true)
    end

    it "should redirect to last visited project", bin3: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      api_create_team_and_project(user: user)

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      wait_for_selector(".switch-teams__joined-team")
      wait_for_selector_list('.teams a').first.click
      wait_for_selector(".project__title")
      wait_for_selector(".project-list__link-all")
      wait_for_selector(".project-list__link-trash")
      wait_for_selector(".project__title")
      wait_for_selector(".team-header__drawer-team-link").click
      wait_for_selector(".project-list__link-all")
      wait_for_selector('.project-list__link').click
      wait_for_selector_none(".team-members__edit-button", :css, 10)

      @driver.navigate.to(@config['self_url'] + '/check/me')
      button = wait_for_selector('#teams-tab')
      button.click
      wait_for_selector(".switch-teams__joined-team")
      wait_for_selector_list('.teams a').last.click
      wait_for_selector(".project__title")
      wait_for_selector(".project-list__link-trash")
      wait_for_selector(".team-header__drawer-team-link").click
      wait_for_selector(".project-list__link-all")

      @driver.navigate.to(@config['self_url'])
      wait_for_selector('.project__title')
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
      wait_for_selector(".team__primary-info")
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
      wait_for_selector('.create-task__add-button').click
      wait_for_selector('.create-task__add-geolocation').click
      wait_for_selector("#task-description-input")
      fill_field('#task-label-input', 'Where?')
      wait_for_selector('.create-task__dialog-submit-button').click
      wait_for_selector_none("#task-label-input")
      wait_for_selector(".media-tab__activity").click
      old = @driver.find_elements(:class, "annotations__list-item").length
      expect(@driver.page_source.include?('Where?')).to be(true)

      # Search map
      wait_for_selector(".media-tab__tasks").click
      expect(@driver.page_source.include?('Salvador, Microrregião de Salvador, Brazil')).to be(false)
      wait_for_selector('.task-type__geolocation > div > div > button').click
      wait_for_selector("#task__response-geolocation-name")
      fill_field("#geolocationsearch", "Salvador")
      wait_for_selector("#geolocationsearch-option-0")
      dropdown = @driver.find_element(:id,'geolocationsearch')
      dropdown.send_keys(:arrow_down)
      dropdown.send_keys(:arrow_down)
      @driver.action.send_keys(:enter).perform
      wait_for_text_change(' ',"#task__response-geolocation-name")
      expect(@driver.page_source.include?('Salvador, Microrregião de Salvador, Brazil')).to be(true)
    end

    it "should go back to previous team", bin1: true do
      user = api_register_and_login_with_email
      t1 = api_create_team(user: user)
      t2 = api_create_team(user: user)

      # Go to first team
      @driver.navigate.to @config['self_url'] + '/' + t1.slug + '/all-items'
      wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/\"]")

      # Navigate to second team
      wait_for_selector('.header__user-menu').click
      wait_for_selector('a[href="/check/me"]').click
      wait_for_selector('#teams-tab').click
      wait_for_selector("#switch-teams__link-to-#{t2.slug}").click
      wait_for_selector(".team-header__drawer-team-link[href=\"/#{t2.slug}/\"]")

      # Navigate back to first team
      wait_for_selector('.header__user-menu').click
      wait_for_selector('a[href="/check/me"]').click
      wait_for_selector('#teams-tab').click
      wait_for_selector("#switch-teams__link-to-#{t1.slug}").click
      wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/\"]")
    end

    it "should go back to primary item", bin1: true do
      # Go to primary item
      api_create_team_project_and_claim_and_redirect_to_media_page
      expect((@driver.title =~ /Claim/).nil?).to be(false)
      expect((@driver.title =~ /Secondary/).nil?).to be(true)

      # Create related item
      wait_for_selector('.media-detail')
      wait_for_selector('.create-related-media__add-button')
      press_button('.create-related-media__add-button')
      wait_for_selector('#create-media__quote').click
      wait_for_selector('#create-media-quote-input')
      fill_field('#create-media-quote-input', 'Secondary Item')
      press_button('#create-media-dialog__submit-button')
      wait_for_selector_none('#create-media-quote-input')

      # Go to related item
      wait_for_selector('.media-condensed__title').click
      wait_for_selector('#media-related__primary-item')
      expect((@driver.title =~ /Claim/).nil?).to be(true)
      expect((@driver.title =~ /Secondary/).nil?).to be(false)

      # Go back to primary item
      wait_for_selector('.media-condensed__title').click
      wait_for_selector('.media-related__secondary-item')
      expect((@driver.title =~ /Claim/).nil?).to be(false)
      expect((@driver.title =~ /Secondary/).nil?).to be(true)
    end

    it "should show current team content on sidebar when viewing profile", bin2: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      @driver.navigate.to(@config['self_url'] + '/check/me')
      wait_for_selector('#teams-tab')
      wait_for_selector(".project-list__link-all")
      expect(@driver.page_source.include?('All items')).to be(true)
    end

    it "should redirect to login page if not logged in and team is private", bin2: true do
      t = api_create_team(private: true, user: OpenStruct.new(email: 'anonymous@test.test'))
      @driver.navigate.to @config['self_url'] + '/' + t.slug + '/all-items'
      wait_for_selector('.login__form')
      expect(@driver.page_source.include?('Sign in')).to be(true)
    end

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
      el.send_keys(:control, 'a', :delete)
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
