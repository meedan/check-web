require_relative './page.rb'
require_relative './project_page.rb'
require_relative './create_team_page.rb'

class LoginPage < Page
  def url
    @config['self_url']
  end

  def register_and_login_with_email(options)
    register_with_email(options)
    login_with_email(options)
  end

  def agree_to_tos(should_submit = true)
    if @driver.find_elements(:css, '#tos__tos-agree').size > 0
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

  def register_with_email(options)
    load
    toggle_form_mode unless form_mode == 'register'

    fill_input('.login__name input', 'User With Email')
    fill_input('.login__email input', options[:email])
    fill_input('.login__password input', options[:password])
    fill_input('.login__password-confirmation input', options[:password])
    fill_input('input[type=file]', options[:file], { hidden: true }) if options[:file]
    agree_to_tos(false)
    # TODO: fix or remove click_button() for mobile browsers
    (@wait.until { @driver.find_element(:xpath, "//button[@id='submit-register-or-login']") }).click
    sleep 3
    @wait.until { @driver.page_source.include?("You have to confirm your email address before continuing.") }
    sleep 3
    confirm_email(options[:email])
    sleep 3
  end

  def reset_password(email)
    load
    (@wait.until { @driver.find_element(:css, '.login__forgot-password a') }).click
    fill_input('#password-reset-email-input', email)
    click_button('.user-password-reset__actions button + button')
    sleep 3
  end

  def login_with_email(options)
    load
    toggle_form_mode unless form_mode == 'login'

    fill_input('.login__email input', options[:email])
    fill_input('.login__password input', options[:password])
    # TODO: fix or remove click_button() for mobile browsers
    (@wait.until { @driver.find_element(:xpath, "//button[@id='submit-register-or-login']") }).click

    wait_for_element('.home')
    return CreateTeamPage.new(config: @config, driver: @driver) if contains_element?('.create-team', {timeout: 1})
    return ProjectPage.new(config: @config, driver: @driver) if contains_element?('.project')
    return ProjectPage.new(config: @config, driver: @driver) if options[:project]
  end

  def login_with_facebook
    @driver.navigate.to 'https://www.facebook.com'
    fill_input('#email', @config['facebook_user'])
    fill_input('#pass', @config['facebook_password'])
    click_button('#loginbutton input')
    sleep 2

    @driver.navigate.to url
    click_button('#facebook-login')
    sleep 3

    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 20
    agree_to_tos
    wait_for_element('.home')
  end

  private

  def form_mode
    (@wait.until { @driver.find_element(:css, '.login__form') }).attribute('name')
  end

  def toggle_form_mode
    (@wait.until { @driver.find_element(:xpath, "//button[@id='register-or-login']") }).click
  end

  def confirm_email(email) # TODO: test real email confirmation flow
    if @config.key?('proxy')
      addr = @config['self_url'].sub 'test.', 'check-api-test.'
      addr = addr + "/test/confirm_user?email="+email
      @driver.navigate.to addr
    else
      request_api('/test/confirm_user', { email: email })
    end
  end
end
