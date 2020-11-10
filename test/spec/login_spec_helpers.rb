module LoginSpecHelpers

  def twitter_login
    @driver.navigate.to 'https://twitter.com/login'
    fill_field('input[name="session[username_or_email]"]', @config['twitter_user'])
    fill_field('input[name="session[password]"]', @config['twitter_password'])
    press_button('div[role="button"]')
    if @driver.page_source.include?("Help us keep your account safe")
      fill_field('input[name="challenge_response"]', @config['twitter_phone_number'])
      press_button('input[type="submit"]')
    elsif @driver.page_source.include?("unusual login activity")
      fill_field('input[name="session[username_or_email]"]', @config['twitter_username'])
      fill_field('input[name="session[password]"]', @config['twitter_password'])
      press_button('div[role="button"]')
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
    press_button('button[data-testid="royal_login_button"]')
    sleep 3
  end

  def facebook_auth
    wait_for_selector("#register")
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
    wait_for_selector_none(".login__name")
    confirm_email(email)
    sleep 3
    login_with_email(true, email) if should_login
  end

  def reset_password(email)
    wait_for_selector('.login__forgot-password a').click
    wait_for_selector('#password-reset-email-input').send_keys(email)
    wait_for_selector('.user-password-reset__actions button + button').click
  end

  def logout
    wait_for_selector(".avatar").click
    wait_for_selector('.user-menu__logout').click
    wait_for_selector('#login-container').click
  end
end