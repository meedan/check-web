module LoginSpecHelpers
  def login_or_register_with_email
    login_with_email(false)
    result = Selenium::WebDriver::Wait.new(timeout: 5).until do
      @driver.find_element(:css, '.home, .message') # success / error
    end
    if result.attribute('class') == 'message'
      register_with_email(false)
      false
    else
      true
    end
  end

  def login_with_email(should_create_team = true, email = @email)
    @driver.navigate.to @config['self_url']
    sleep 2
    fill_field('.int-login__email-input input', email)
    fill_field('.int-login__password-input input', 'checkTest@12')
    press_button('#submit-register-or-login')
    sleep 3
    create_team if should_create_team
  end

  def register_with_email(_should_create_team = true, email = @email, should_login = true)
    @driver.navigate.to @config['self_url']
    wait_for_selector('#register').click
    wait_for_selector('.login__name-input input')
    fill_field('.login__name-input input', 'User With Email')
    fill_field('.int-login__email-input input', email)
    fill_field('.int-login__password-input input', 'checkTest@12')
    fill_field('.int-login__password-confirmation input', 'checkTest@12')
    agree_to_tos(false)
    press_button('#submit-register-or-login')
    wait_for_selector('.message')
    confirm_email(email)
    sleep 3
    login_with_email(true, email) if should_login
  end

  def reset_password(email)
    wait_for_selector('.login__forgot-password').click
    wait_for_selector('#password-reset-email-input').send_keys(email)
    wait_for_selector('.user-password-reset__actions button + button').click
  end

  def logout
    wait_for_selector('.user-menu__avatar').click
    wait_for_selector('.user-menu__logout').click
    wait_for_selector('#login-container').click
  end
end
