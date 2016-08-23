module AppSpecHelpers
  def port_open?(port)
    !system("lsof -i:#{port}", out: '/dev/null')
  end

  def get_element(selector, type = :css)
    sleep 3
    wait = Selenium::WebDriver::Wait.new(timeout: 5000)
    return wait.until {
      element = @driver.find_element(type, selector)
      element if element.displayed?
    }
  end

  def fill_field(selector, value, type = :css)
    wait = Selenium::WebDriver::Wait.new(timeout: 100)
    input = wait.until {
      element = @driver.find_element(type, selector)
      element if element.displayed?
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
    sleep 3
  end

  def twitter_auth
    @driver.find_element(:xpath, "//button[@id='twitter-login']").click
    sleep 10
    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 1
  end

  def login_with_twitter
    twitter_login
    @driver.navigate.to 'http://localhost:3333/'
    sleep 1
    twitter_auth
  end

  def login_with_email
    @driver.navigate.to 'http://localhost:3333/'
    sleep 2
    @driver.find_element(:xpath, "//a[@id='login-email']").click
    fill_field('.login-email input', @email)
    fill_field('.login-password input', '12345678')
    press_button('#submit-register-or-login')
    sleep 3
  end

  def facebook_login
    @driver.navigate.to 'https://www.facebook.com'
    wait = Selenium::WebDriver::Wait.new(timeout: 100)
    fill_field('#email', @config['facebook_user'])
    fill_field('#pass', @config['facebook_password'])
    press_button('#u_0_l')
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
    @driver.navigate.to 'http://localhost:3333/'
    sleep 1
    facebook_auth
  end
end
