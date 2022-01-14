require 'selenium-webdriver'
require 'yaml'
require_relative './spec_helper'
require_relative './app_spec_helpers'
require_relative './annotation_spec'
require_relative './annotation_spec_helpers'
require_relative './api_helpers'
require_relative './flaky_tests_spec'
require_relative './language_spec'
require_relative './login_spec'
require_relative './login_spec_helpers'
require_relative './media_actions_spec'
require_relative './media_spec'
require_relative './project_spec'
require_relative './report_spec'
require_relative './rules_spec'
require_relative './search_spec'
require_relative './status_spec'
require_relative './tag_spec'
require_relative './tag_spec_helpers'
require_relative './team_spec'
require_relative './team_spec_helpers'
require_relative './video_timeline_spec'
require_relative './similarity_spec'
require_relative './source_spec'

CONFIG = YAML.load_file('config.yml')

shared_examples 'app' do |webdriver_url|
  # Helpers
  include AnnotationSpecHelpers
  include AppSpecHelpers
  include ApiHelpers
  include TagSpecHelpers
  include TeamSpecHelpers
  include LoginSpecHelpers
  include FlakyTests

  before :all do
    @config = CONFIG
    @webdriver_url = webdriver_url
    @failing_tests = {}
    FileUtils.rm('../build/web/js/config.js') if File.exist?('../build/web/js/config.js')
    FileUtils.ln_sf(File.realpath('./config.js'), '../build/web/js/config.js')
  end

  before :each do |example|
    $caller_name = example.metadata[:description_args]
  end

  around(:each) do |example|
    @wait = Selenium::WebDriver::Wait.new(timeout: 10)
    @driver = new_driver
    begin
      example.run
    ensure
      @driver.quit
    end
  end

  before :each do |example|
    @password = '12345678'

    test_hash = [example.metadata[:description_args], Process.pid].hash.to_s
    @email = "sysops+#{test_hash}@meedan.com"
    @source_name = 'Iron Maiden'
    @source_url = "https://twitter.com/ironmaiden?_test_hash=#{test_hash}"
    @media_url = "https://twitter.com/meedan/status/773947372527288320/?_test_hash=#{test_hash}"
    @team1_slug = "team1_#{test_hash}"
    @user_mail = "sysops_#{test_hash}@meedan.com"
  end

  after :each do |example|
    flaky = {}
    link = save_screenshot("Test failed: #{example.description}")
    if example.exception
      if @failing_tests.key? example.description
        @failing_tests[example.description]['failures'] = example.metadata[:retry_attempts] + 1
        @failing_tests[example.description]['imgur'] = link
      else
        flaky['failures'] = example.metadata[:retry_attempts] + 1
        flaky['imgur'] = link
        @failing_tests[example.description] = flaky
      end
      print "[Test #{example.description} failed! Check screenshot at #{link}"
    end
  end

  after :all do
    FileUtils.rm('../build/web/js/config.js') if File.exist?('../build/web/js/config.js')
    FileUtils.ln_sf(File.realpath('../config.js'), '../build/web/js/config.js')
    update_flaky_tests_file(@failing_tests)
  end

  # The tests themselves start here
  context 'web' do
    include_examples 'language'
    include_examples 'login'
    include_examples 'media actions'
    include_examples 'annotation'
    include_examples 'project'
    include_examples 'report'
    include_examples 'rules'
    include_examples 'search'
    include_examples 'source'
    include_examples 'status'
    include_examples 'tag'
    include_examples 'team'
    include_examples 'videotimeline'
    include_examples 'similarity'
    it_behaves_like 'media', 'BELONGS_TO_ONE_PROJECT'
    it_behaves_like 'media', 'DOES_NOT_BELONG_TO_ANY_PROJECT'

    it 'should redirect to not found page when access is denied', bin1: true do
      user = api_register_and_login_with_email
      api_logout
      api_register_and_login_with_email
      @driver.navigate.to("#{@config['self_url']}/check/me")
      wait_for_selector('#teams-tab').click
      wait_for_selector("//span[contains(text(), 'Create')]", :xpath)
      expect(@driver.page_source.include?('page does not exist')).to be(false)
      expect((@driver.current_url.to_s =~ %r{/not-found$}).nil?).to be(true)
      @driver.navigate.to(@config['self_url'] + "/check/user/#{user.dbid}") # unauthorized page
      wait_for_selector('.not-found__component')
      expect(@driver.page_source.include?('page does not exist')).to be(true)
      expect((@driver.current_url.to_s =~ %r{/not-found$}).nil?).to be(false)
    end

    it 'should localize interface based on browser language', bin6: true do
      @driver.quit
      @driver = new_driver(chrome_prefs: { 'intl.accept_languages' => 'fr' })
      @driver.navigate.to @config['self_url']
      wait_for_selector('.login__form')
      wait_for_selector('.login__icon')
      expect(@driver.find_element(:css, '.login__heading span').text == 'Connexion').to be(true)

      @driver.quit
      @driver = new_driver(chrome_prefs: { 'intl.accept_languages' => 'pt' })
      @driver.navigate.to @config['self_url']
      wait_for_selector('.login__form')
      wait_for_selector('.login__icon')
      expect(@driver.find_element(:css, '.login__heading span').text == 'Iniciar sessão').to be(true)
    end

    it 'should access user confirmed page', bin5: true do
      @driver.navigate.to "#{@config['self_url']}/check/user/confirm/confirmed"
      title = wait_for_selector('.confirm__heading')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it 'should access user unconfirmed page', bin5: true do
      @driver.navigate.to "#{@config['self_url']}/check/user/confirm/unconfirmed"
      unconfirmed_msg = wait_for_selector('.confirm_content').text
      expect(unconfirmed_msg.include?('Sorry, an error occurred while confirming your account')).to be(true)
    end

    it 'should access user already confirmed page', bin5: true do
      @driver.navigate.to "#{@config['self_url']}/check/user/confirm/already-confirmed"
      title = wait_for_selector('.confirm__heading')
      expect(title.text == 'Account Already Confirmed').to be(true)
    end

    it 'should redirect to 404 page', bin4: true do
      api_register_and_login_with_email
      @driver.navigate.to "#{@config['self_url']}/something-that-does-not-exist"
      title = wait_for_selector('.not-found__component')
      expect(title.text).to match(/page does not exist/)
    end

    it 'should redirect to login screen if not logged in', bin5: true do
      @driver.navigate.to "#{@config['self_url']}/check/teams"
      title = wait_for_selector('.login__heading')
      expect(title.text == 'Sign in').to be(true)
    end

    it 'should go back and forward in the history', bin4: true do
      @driver.navigate.to @config['self_url']
      expect((@driver.current_url.to_s =~ %r{/$}).nil?).to be(false)
      @driver.navigate.to "#{@config['self_url']}/check/terms-of-service"
      expect((@driver.current_url.to_s =~ %r{/terms-of-service$}).nil?).to be(false)
      @driver.navigate.back
      expect((@driver.current_url.to_s =~ %r{/$}).nil?).to be(false)
      @driver.navigate.forward
      expect((@driver.current_url.to_s =~ %r{/terms-of-service$}).nil?).to be(false)
    end

    it 'should redirect to 404 page if id does not exist', bin4: true do
      api_create_team_and_project
      @driver.navigate.to @config['self_url']
      wait_for_selector('#create-media__add-item')
      url = @driver.current_url.to_s
      @driver.navigate.to url.gsub(%r{project/([0-9]+).*}, 'project/999')
      title = wait_for_selector('.not-found__component')
      expect(title.text).to match(/page does not exist/)
      expect((@driver.current_url.to_s =~ %r{/not-found$}).nil?).to be(false)
    end

    it 'should give 404 when trying to access a media that is not related to the project on the URL', bin1: true do
      t1 = api_create_team_and_project
      data = api_create_team_project_and_link({ url: 'https://twitter.com/TheWho/status/890135323216367616' })
      url = data.full_url
      url = url[0..data.full_url.index('project') + 7] + t1[:project].dbid.to_s + url[url.index('/media')..url.length - 1]
      @driver.navigate.to url
      wait_for_selector('not-found__component', :class)
      title = wait_for_selector('.not-found__component')
      expect(title.text).to match(/page does not exist/)
    end

    it 'should go back to the right url from the item page', bin3: true do
      # item created in a project
      api_create_team_project_and_claim_and_redirect_to_media_page
      wait_for_selector('.media__annotations-tabs')
      wait_for_selector('.project-header__back-button').click
      wait_for_selector('#search-input')
      wait_for_selector_list_size('.medias__item', 1, :css, 30)
      expect(@driver.current_url.to_s.match(%r{/project/[0-9]+$}).nil?).to be(false) # project page
      # send this item to trash go to the item page and go back to trash page
      wait_for_selector('table input[type=checkbox]').click
      wait_for_selector('#media-bulk-actions')
      wait_for_selector('.media-bulk-actions__delete-icon').click
      wait_for_selector_none('.medias__item')
      expect(@driver.find_elements(:css, '.media__heading').length.zero?).to be(true)
      @driver.navigate.to "#{@config['self_url']}/#{get_team}/trash"
      wait_for_selector("//span[contains(text(), 'Trash')]", :xpath)
      wait_for_selector('.medias__item', :css, 20, true)
      wait_for_selector('.media__heading').click
      wait_for_selector('.media-actions__icon')
      wait_for_selector('.project-header__back-button').click
      all = wait_for_selector('.projects-list__all-items')
      expect(@driver.current_url.to_s.match(/trash/).nil?).to be(false) # trash page
      # item created from "all items" page
      all.click
      create_media('claim 2', false)
      wait_for_selector('.media__heading', :css, 20, true).click
      wait_for_selector('.project-header__back-button').click
      wait_for_selector_list_size('.medias__item', 1, :css, 30)
      wait_for_selector('#create-media__add-item')
      expect(@driver.current_url.to_s.match(/all-items/).nil?).to be(false) # all items page
    end

    it 'should linkify URLs on comments', bin1: true do
      api_create_team_project_and_claim_and_redirect_to_media_page
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(false)
      wait_for_selector('.media-tab__comments').click
      fill_field('#cmd-input', 'https://meedan.com/en/')
      @driver.action.send_keys(:enter).perform
      wait_for_selector('.annotation__avatar-col')
      wait_for_size_change(0, 'annotation__card-content', :class, 25)
      expect(@driver.page_source.include?('https://meedan.com/en/')).to be(true)
      expect(wait_for_selector_list("//a[contains(text(), 'https://meedan.com/en/')]", :xpath).length == 1).to be(true)
    end

    it 'should set metatags', bin5: true do
      url = 'https://twitter.com/marcouza/status/875424957613920256'
      api_create_team_project_and_link_and_redirect_to_media_page({ url: url })
      request_api('make_team_public', { slug: get_team })
      wait_for_selector('.more-less')
      url = @driver.current_url.to_s
      @driver.navigate.to url
      wait_for_selector('.more-less')
      site = @driver.find_element(:css, 'meta[name="twitter\\:site"]').attribute('content')
      expect(site == 'check').to be(true)
    end

    it 'should show current team content on sidebar when viewing profile', bin3: true do
      user = api_register_and_login_with_email
      api_create_team_and_project(user: user)
      @driver.navigate.to("#{@config['self_url']}/check/me")
      wait_for_selector('#teams-tab')
      wait_for_selector('.team-header__drawer-team-link')
    end
  end
end
