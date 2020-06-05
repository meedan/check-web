module AppSpecHelpers
  def update_field(selector, value, type = :css, visible = true)
    wait = Selenium::WebDriver::Wait.new(timeout: 50)
    input = wait.until {
      element = @driver.find_element(type, selector)
      if visible
        element if element.displayed?
      else
        element
      end
    }
    sleep 0.5
    input.send_keys(:control, 'a', :delete)
    sleep 0.5
    input.send_keys(value)
  end

  def fill_field(selector, value, type = :css, visible = true)
    wait = Selenium::WebDriver::Wait.new(timeout: 50)
    input = wait.until {
      element = @driver.find_element(type, selector)
      if visible
        element if element.displayed?
      else
        element
      end
    }
    sleep 1
    input.send_keys(value)
  end

  def press_button(selector = 'button', type = :css)
    wait = Selenium::WebDriver::Wait.new(timeout: 100)
    input = wait.until {
      element = @driver.find_element(type, selector)
      element if element.displayed?
    }
    input.click
  end

  def alert_accept
    begin
      @driver.switch_to.alert.accept
      return true
    rescue => e
      sleep 2
      return false
    end
  end

  def delete_task(task_text)
    expect(@driver.page_source.include?(task_text)).to be(true)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__delete').click

    n = 0
    ret = false
    begin
      ret = alert_accept
      n = n + 1
    end while (!ret and n < 10)

    wait = Selenium::WebDriver::Wait.new(timeout: 90)
    wait.until { !@driver.page_source.include?(task_text) }
    expect(@driver.page_source.include?(task_text)).to be(false)
  end

  def twitter_login
    @driver.navigate.to 'https://twitter.com/login'
    fill_field('input[name="session[username_or_email]"]', @config['twitter_user'])
    fill_field('input[name="session[password]"]', @config['twitter_password'])
    press_button('div[role="button"]')
    if @driver.page_source.include?("Help us keep your account safe")
      fill_field('input[name="challenge_response"]',@config['twitter_phone_number'])
      press_button('input[type="submit"]')
    end
    @wait.until {
      @driver.page_source.include?("#{@config['twitter_name']}")
    }
  end

  def twitter_auth
    sleep 3
    @driver.find_element(:xpath, "//button[@id='twitter-login']").click
    sleep 5
    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 5
  end

  def login_with_twitter
    twitter_login
    @driver.navigate.to @config['self_url']
    sleep 1
    twitter_auth
    agree_to_tos
    create_team
  end

  def slack_login
    @driver.navigate.to "https://#{@config['slack_domain']}.slack.com"
    fill_field('#email', @config['slack_user'])
    fill_field('#password', @config['slack_password'])
    press_button('#signin_btn')
    sleep 3
  end

  def wait_for_selector(selector, type = :css, timeout = 20, index = 0)
    wait_for_selector_list_size(selector, index + 1, type, timeout)[index]
  end

  def wait_for_selector_list(selector, type = :css, timeout = 20, test = 'unknown')
    predicate = lambda { |elements| elements.size >= 1 }
    message = lambda { |n_seconds| "Did not find any elements with #{type.upcase} '#{selector}' after #{n_seconds} seconds" }
    wait_for_selector_list_matching_predicate(selector, predicate, message, type: type, timeout: timeout)
  end

  def wait_for_selector_list_size(selector, size, type = :css, timeout = 20)
    predicate = lambda { |elements| elements.size >= size }
    message = lambda { |elements| "Found #{elements.size} elements with #{type.upcase} '#{selector}' and expected #{size}" }
    wait_for_selector_list_matching_predicate(selector, predicate, message, type: type, timeout: timeout)
  end

  def wait_for_selector_none(selector, type = :css)
    predicate = lambda { |elements| elements.size == 0 }
    message = lambda { |elements| "Found #{elements.size} elements with #{type.upcase} '#{selector}' and expected none" }
    wait_for_selector_list_matching_predicate(selector, predicate, message, type: type)
  end

  def wait_for_size_change(size, selector, type = :css)
    predicate = lambda { |elements| elements.size == 0 }
    message = lambda { |elements| "Found #{elements.size} elements with #{type.upcase} '#{selector}' and expected any other number" }
    elements = wait_for_selector_list_matching_predicate(selector, predicate, message, type: type)
    elements.size
  end

  def wait_for_selector_list_matching_predicate(selector, predicate, build_message, type: :css, timeout: 20)
    start = Time.now
    wait = Selenium::WebDriver::Wait.new(timeout: timeout, interval: 0.5)
    sleep 0.5  # TODO nix
    elements = nil
    begin
      wait.until {
        elements = @driver.find_elements(type, selector)
        predicate.call(elements)
      }
      elements
    rescue Selenium::WebDriver::Error::TimeoutError
      finish = (Time.now - start).to_i
      raise "#{build_message.call(elements)} after #{finish}s"
    end
  end

  def wait_for_text_change(txt, selector, type = :css, count = 10)
    c = 0
    begin
      c = c + 1
      el = wait_for_selector(selector, type)
      sleep 1
    end while (el.text == txt and c < count)
    el.text
  end

  def slack_auth
    wait_for_selector("//button[@id='slack-login']", :xpath).click
    sleep 5
    window = @driver.window_handles.last
    @driver.switch_to.window(window)
    wait_for_selector(".p-oauth_page__buttons button", :css).click
    sleep 5
    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 1
  end

  def login_with_slack
    slack_login
    @driver.navigate.to @config['self_url']
    sleep 1
    slack_auth
    agree_to_tos
    create_team
  end

  def login_or_register_with_email
    login_with_email(false)
    result = Selenium::WebDriver::Wait.new(timeout: 5).until {
      @driver.find_element(:css, '.home, .message') # success / error
    }
    if result.attribute('class') == 'message'
      register_with_email(false)
      return false
    else
      return true
    end
  end

  def login_with_email(should_create_team = true, email = @email)
    @driver.navigate.to @config['self_url']
    sleep 2
    fill_field('.login__email input', email)
    fill_field('.login__password input', '12345678')
    press_button('#submit-register-or-login')
    sleep 3
    create_team if should_create_team
  end

  def facebook_login
    @driver.navigate.to 'https://www.facebook.com'
    wait = Selenium::WebDriver::Wait.new(timeout: 100)
    fill_field('#email', @config['facebook_user'])
    fill_field('#pass', @config['facebook_password'])
    press_button('#loginbutton input')
    sleep 3
  end

  def facebook_auth
    @driver.find_element(:xpath, "//button[@id='facebook-login']").click
    sleep 10
    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 1
  end

  def login_with_facebook
    facebook_login
    @driver.navigate.to @config['self_url']
    sleep 1
    facebook_auth
    agree_to_tos
    create_team
  end

  def agree_to_tos(should_submit = true)
    element = wait_for_selector('#tos__tos-agree', :css, 10)
    if element != nil
      @driver.find_element(:css, '#tos__tos-agree').click
      sleep 1
      @driver.find_element(:css, '#tos__pp-agree').click
      sleep 1
      if should_submit
        @driver.find_element(:css, '#tos__save').click
        sleep 20
      end
    end
    wait_for_selector_none("#tos__save")
  end

  def create_team
    if @driver.find_elements(:css, '.create-team').size > 0
      if @driver.find_elements(:css, '.find-team-card').size > 0
        el = wait_for_selector('.find-team__toggle-create')
        el.click
      end
      fill_field('#team-name-container', "Team #{Time.now}")
      fill_field('#team-slug-container', "team#{Time.now.to_i}#{Process.pid}")
      press_button('.create-team__submit-button')
      sleep 0.5
    end
    @driver.navigate.to @config['self_url']
    sleep 0.5
  end

  def create_project(title = "Project #{Time.now}")
    fill_field('#create-project-title', title)
    @driver.action.send_keys(:enter).perform
  end

  def register_with_email(should_create_team = true, email = @email, should_login = true)
    @driver.navigate.to @config['self_url']
    wait_for_selector("#register").click
    wait_for_selector(".login__name input")
    fill_field('.login__name input', 'User With Email')
    fill_field('.login__email input', email)
    fill_field('.login__password input', '12345678')
    fill_field('.login__password-confirmation input', '12345678')
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    agree_to_tos(false)
    press_button('#submit-register-or-login')
    sleep 3
    confirm_email(email)
    sleep 1
    login_with_email(true, email) if should_login
  end

  def get_team
    @driver.execute_script('var context = Check.store.getState().app.context; return context.team ? context.team.slug : context.currentUser.current_team.slug').to_s
  end

  def get_project
    @driver.execute_script('return Check.store.getState().app.context.project.dbid').to_s
  end

  def console_logs
    require 'pp'
    @driver.manage.logs.get("browser").pretty_inspect
  end

  def create_media(url)
    wait_for_selector("#create-media__add-item").click
    fill_field('#create-media-input', url)
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-input")
    wait_for_selector(".media__heading a")
  end

  def create_image(file)
    wait_for_selector('#create-media__add-item').click
    wait_for_selector("#create-media__image").click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), "#{file}"))

    sleep 8

    wait_for_selector("#create-media-dialog__submit-button").click
  end

  def team_url(path)
    @config['self_url'] + '/' + get_team + '/' + path
  end

  def create_claim_and_go_to_search_page
    page = LoginPage.new(config: @config, driver: @driver).load.login_with_email(email: @email, password: @password)
    @wait.until { @driver.page_source.include?('Claim') }
    page.create_media(input: 'My search result')

    sleep 8 # wait for Sidekiq

    @driver.navigate.to @config['self_url'] + '/' + get_team + '/search'

    sleep 8 # wait for Godot

    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  def create_team_project_and_image_and_redirect_to_media_page
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#create-media__add-item').click
    wait_for_selector("#create-media__image").click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector_none(".without-file")
    wait_for_selector("#create-media-dialog__submit-button").click
    wait_for_selector('.medias__item')
    wait_for_selector(".media__heading a").click
    wait_for_selector(".media__annotations-column")
  end

  def save_screenshot(title)
    require 'imgur'
    path = '/tmp/' + (0...8).map{ (65 + rand(26)).chr }.join + '.png'
    @driver.save_screenshot(path)

    client = Imgur.new(@config['imgur_client_id'])
    image = Imgur::LocalImage.new(path, title: title)
    uploaded = client.upload(image)
    uploaded.link
  end

  def wait_page_load(options = {})
    driver = options[:driver] || @driver
    item = options[:item] || "root"
    @wait.until {driver.page_source.include?(item) }
  end

  def go(new_url)
    if defined? $caller_name and $caller_name.length > 0
      method_id = $caller_name[0]
      method_id.gsub! (/(\s)/), '_'
      method_id.gsub! (/("|\[|\])/), ''
      if new_url.include? '?'
        new_url = new_url + '&test_id='+method_id
      else
        new_url = new_url + '?test_id='+method_id
      end
    end
    @driver.navigate.to new_url
  end

  def new_driver(args: [], prefs: {})
    chrome_options = Selenium::WebDriver::Chrome::Options.new
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-translate')
    args.each { |arg| chrome_options.add_argument(arg) }
    prefs.each { |k, v| chrome_options.add_preference(k, v) }
    if (Dir.entries(".").include? "extension.crx")
      chrome_options.add_encoded_extension(
        Base64.strict_encode64(File.open('./extension.crx', 'rb').read)
      )
    end

    if @config.key?('proxy')
      proxy = Selenium::WebDriver::Proxy.new(
        :http     => @config['proxy'],
        :ftp      => @config['proxy'],
        :ssl      => @config['proxy']
      )
      chrome_options.set_capability(:proxy, proxy)
    end

    capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
      "goog:chromeOptions" => chrome_options
    )

    Selenium::WebDriver.for(:remote, desired_capabilities: capabilities , url: @webdriver_url)
  end

  def driver_block(args: [], prefs: {}, &block)
    driver = new_driver(args: args, prefs: prefs)
    begin
      block.call(driver)
    ensure
      driver.quit
    end
  end

  def install_bot (team, bot_name)
    api_create_bot
    @driver.navigate.to @config['self_url'] + '/' + team
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__bots-tab').click
    # Install bot
    wait_for_selector('#team-bots__bot-garden-button').click
    wait_for_selector(".bot-garden__bot-name")
    bot = wait_for_selector("//span[contains(text(), '#{bot_name}')]", :xpath)
    bot.click
    wait_for_selector('#bot__install-button').click
    @driver.navigate.to @config['self_url'] + '/' + team
  end

  def generate_a_report_and_copy_report_code
    wait_for_selector('#media-detail__report-designer').click
    wait_for_selector('#report-designer__actions-copy').click
  end

  def change_the_status_to(status_class, confirm)
    wait_for_selector(".media-detail")
    wait_for_selector(".media-status__current").click
    wait_for_selector(".media-status__menu-item")
    wait_for_selector(status_class).click
    if confirm
      wait_for_selector(".media-status__proceed-send").click unless (status_class == ".media-status__menu-item--in-progress")
    end
    wait_for_selector_none(".media-status__menu-item")
  end

  def change_the_member_role_to(rule_class)
    wait_for_selector('.team-members__edit-button', :css).click
    wait_for_selector('.role-select', :css, 29, 1).click
    wait_for_selector(rule_class).click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.team-members__edit-button', :css).click
  end
end
