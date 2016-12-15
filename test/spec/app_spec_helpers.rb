module AppSpecHelpers
  def port_open?(port)
    !system("lsof -i:#{port}", out: '/dev/null')
  end

  def get_element(selector, type = :css)
    sleep 3
    wait = Selenium::WebDriver::Wait.new(timeout: 5)
    return wait.until {
      element = @driver.find_element(type, selector)
      element if element.displayed?
    }
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

  def twitter_login
    @driver.navigate.to 'https://twitter.com/login'
    fill_field('.js-username-field', @config['twitter_user'])
    fill_field('.js-password-field', @config['twitter_password'])
    press_button
    @wait.until {
      @driver.page_source.include?("#{@config['twitter_name']}")
    }
  end

  def twitter_auth
    @driver.find_element(:xpath, "//button[@id='twitter-login']").click
    sleep 10
    window = @driver.window_handles.first
    @driver.switch_to.window(window)
  end

  def login_with_twitter
    twitter_login
    @driver.navigate.to @config['self_url']
    sleep 1
    twitter_auth
    create_team
  end

  def slack_login
    @driver.navigate.to "https://#{@config['slack_domain']}.slack.com"
    fill_field('#email', @config['slack_user'])
    fill_field('#password', @config['slack_password'])
    press_button('#signin_btn')
    sleep 3
  end

  def slack_auth
    @driver.find_element(:xpath, "//button[@id='slack-login']").click
    sleep 5
    window = @driver.window_handles.last
    @driver.switch_to.window(window)
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
    @driver.find_element(:xpath, "//a[@id='login-email']").click
    fill_field('.login-email__email input', email)
    fill_field('.login-email__password input', '12345678')
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
    create_team
  end

  def create_team
    if @driver.find_elements(:css, '.create-team').size > 0
      fill_field('#team-name-container', "Team #{Time.now}")
      fill_field('#team-subdomain-container', "team#{Time.now.to_i}")
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
    @driver.find_element(:xpath, "//a[@id='login-email']").click
    sleep 1
    @driver.find_element(:xpath, "//button[@id='register-or-login']").click
    sleep 1
    fill_field('.login-email__name input', 'User With Email')
    fill_field('.login-email__email input', email)
    fill_field('.login-email__password input', '12345678')
    fill_field('.login-email__password-confirmation input', '12345678')
    press_button('#submit-register-or-login')
    sleep 3
    confirm_email(email)
    sleep 1
    login_with_email(true, email)
  end

  def get_team
    @driver.execute_script('return Checkdesk.context.team ? Checkdesk.context.team.subdomain : Checkdesk.currentUser.current_team.subdomain').to_s
  end

  def get_project
    @driver.execute_script('return Checkdesk.context.project.dbid').to_s
  end

  def console_logs
    @driver.manage.logs.get("browser")
  end

  def create_media(url)
    fill_field('#create-media-input', url)
    press_button('#create-media-submit')
  end

  def team_url(path)
    @config['self_url'].gsub('//', '//' + get_team + '.') + '/' + path
  end

  def confirm_email(email)
    request_api('/test/confirm_user', { email: email })
  end

  def request_api(path, params)
    require 'net/http'
    api_path = @driver.execute_script("return config.restBaseUrl.replace(/\\/api\\/.*/, '#{path}')").to_s
    uri = URI(api_path)
    uri.query = URI.encode_www_form(params)
    Net::HTTP.get_response(uri)
  end
end
