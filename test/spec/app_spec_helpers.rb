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
    input.clear
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
    wait_for_selector('.task__label').click
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
    fill_field('.js-username-field', @config['twitter_user'])
    fill_field('.js-password-field', @config['twitter_password'])
    press_button('button.submit')
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

  def wait_for_selector(selector, type = :css, timeout = 25, index = 0)
    wait_for_selector_list(selector, type, timeout)[index]
  end

  def wait_for_selector_list(selector, type = :css, timeout = 25, test = 'unknown')
    elements = []
    attempts = 0
    wait = Selenium::WebDriver::Wait.new(timeout: timeout)
    while elements.empty? && attempts < 10 do
      attempts += 1
      sleep 2
      begin
        elements = wait.until { @driver.find_elements(type, selector) }
        elements.map(&:displayed?)
      rescue
        elements = []
      end
    end
    puts "Could not find element with selector #{type.upcase} '#{selector}' for test '#{test}'!" if elements.empty?
    elements
  end

  def wait_for_selector_list_size(selector, size, type = :css, retries = 10, test = 'unknown')
    elements = []
    attempts = 0
    wait = Selenium::WebDriver::Wait.new(timeout: 2)
    while elements.length < size && attempts < retries do
      attempts += 1
      sleep 2
      begin
        elements = wait.until { @driver.find_elements(type, selector) }
        elements.map(&:displayed?)
      rescue
        elements = []
      end
    end
    puts "Could not find element with selector #{type.upcase} '#{selector}' for test '#{test}'!" if elements.empty?
    elements
  end

  def wait_for_selector_none(selector, type = :css, retries = 10, test = 'unknown')
    elements = @driver.find_elements(type, selector)
    attempts = 0
    begin
      attempts += 1
      sleep 2
      begin
        elements = @driver.find_elements(type, selector)
        elements.map(&:displayed?)
      rescue
        elements = []
      end
    end while elements.length > 0 && attempts < retries
    puts "Element with selector #{type.upcase} '#{selector}' did not disappear for test '#{test}'!" if !elements.empty?
    elements
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

  def wait_for_size_change(s, selector, type = :css, count = 30, test = 'unknown')
    c = 0
    begin
      c += 1
      el = wait_for_selector_list(selector, type, 25, test)
      sleep 3
    end while (s == el.size and c < count)
    el.size
  end

  def slack_auth
    wait_for_selector("//button[@id='slack-login']", :xpath).click
    sleep 5
    window = @driver.window_handles.last
    @driver.switch_to.window(window)
    sleep 10
    press_button('#oauth_authorizify')
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

  def register_with_email(should_create_team = true, email = @email)
    @driver.navigate.to @config['self_url']
    sleep 1
    @driver.find_element(:xpath, "//button[@id='register-or-login']").click
    sleep 1
    fill_field('.login__name input', 'User With Email')
    fill_field('.login__email input', email)
    fill_field('.login__password input', '12345678')
    fill_field('.login__password-confirmation input', '12345678')
    agree_to_tos(false)
    press_button('#submit-register-or-login')
    sleep 3
    confirm_email(email)
    sleep 1
    login_with_email(true, email)
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
    wait_for_selector("create-media__add-item", :id).click
    fill_field('#create-media-input', url)
    press_button('#create-media-submit')
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


  def new_driver(webdriver_url, browser_capabilities)
    if @config.key?('proxy') and !webdriver_url.include? "browserstack"
      proxy = Selenium::WebDriver::Proxy.new(
        :http     => @config['proxy'],
        :ftp      => @config['proxy'],
        :ssl      => @config['proxy']
      )
      if (Dir.entries(".").include? "extension.crx")
        caps = Selenium::WebDriver::Remote::Capabilities.chrome ({
            'chromeOptions' => {
              'extensions' => [
                Base64.strict_encode64(File.open('./extension.crx', 'rb').read)
              ]
            }, :proxy => proxy
          })
      else
        caps = Selenium::WebDriver::Remote::Capabilities.chrome(:proxy => proxy)
      end
      dr = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => webdriver_url)
    else
      if ((Dir.entries(".").include? "extension.crx") and (browser_capabilities == :chrome))
        caps = Selenium::WebDriver::Remote::Capabilities.chrome ({
            'chromeOptions' => {
              'extensions' => [
                Base64.strict_encode64(File.open('./extension.crx', 'rb').read)
              ]
            }
          })
        dr = Selenium::WebDriver.for(:chrome, :desired_capabilities => caps , :url => webdriver_url)
      else
        dr = Selenium::WebDriver.for(:remote, url: webdriver_url, desired_capabilities: browser_capabilities)
      end
    end
    dr
  end
end
