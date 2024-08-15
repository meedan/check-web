require 'selenium-webdriver'
require 'yaml'
require_relative './spec_helper'
require_relative './app_spec_helpers'
require_relative './articles_spec'
require_relative './annotation_spec'
require_relative './annotation_spec_helpers'
require_relative './api_helpers'
require_relative './flaky_tests_spec'
require_relative './language_spec'
require_relative './login_spec'
require_relative './login_spec_helpers'
require_relative './media_actions_spec'
require_relative './media_spec'
require_relative './list_spec'
require_relative './rules_spec'
require_relative './search_spec'
require_relative './status_spec'
require_relative './tag_spec'
require_relative './tag_spec_helpers'
require_relative './team_spec'
require_relative './team_spec_helpers'
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
    if File.directory?('../build/web/js/config.js')
      FileUtils.rm('../build/web/js/config.js')
      FileUtils.ln_sf(File.realpath('./config.js'), '../build/web/js/config.js')
    end
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
      @driver&.quit
    end
  end

  before :each do |example|
    @password = 'checkTest@12'

    test_hash = [example.metadata[:description_args], Process.pid].hash.to_s
    @email = "sysops+#{test_hash}@meedan.com"
    @source_name = 'Iron Maiden'
    @media_url = 'http://localhost:3000/index.html'
    @team1_slug = "team1_#{test_hash}"
    @user_mail = "sysops_#{test_hash}@meedan.com"
  end

  after :each do |example|
    flaky = {}
    if example.exception
      link = save_screenshot("Test failed: #{example.description}")
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
    if File.directory?('../build/web/js/config.js')
      FileUtils.rm('../build/web/js/config.js')
      FileUtils.ln_sf(File.realpath('./config.js'), '../build/web/js/config.js')
    end
    update_flaky_tests_file(@failing_tests)
  end

  # The tests themselves start here
  context 'web' do
    include_examples 'articles'
    include_examples 'language'
    include_examples 'login'
    include_examples 'media actions'
    include_examples 'annotation'
    include_examples 'list'
    include_examples 'rules'
    include_examples 'search'
    include_examples 'source'
    include_examples 'status'
    include_examples 'tag'
    include_examples 'team'
    include_examples 'similarity'
    it_behaves_like 'media', 'DOES_NOT_BELONG_TO_ANY_PROJECT'

    it 'should localize interface based on browser language', bin2: true do
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

    it 'should access user confirmed page', bin1: true do
      @driver.navigate.to "#{@config['self_url']}/check/user/confirm/confirmed"
      title = wait_for_selector('.confirm__heading')
      expect(title.text == 'Account Confirmed').to be(true)
    end

    it 'should access user unconfirmed page', bin1: true do
      @driver.navigate.to "#{@config['self_url']}/check/user/confirm/unconfirmed"
      unconfirmed_msg = wait_for_selector('.confirm_content').text
      expect(unconfirmed_msg.include?('Sorry, an error occurred while confirming your account')).to be(true)
    end

    it 'should access user already confirmed page', bin1: true do
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

    it 'should redirect to login screen if not logged in', bin1: true do
      @driver.navigate.to "#{@config['self_url']}/check/me"
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
  end
end
