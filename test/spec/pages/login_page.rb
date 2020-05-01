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
      wait_for_selector('#tos__tos-agree').click
      wait_for_selector('#tos__pp-agree').click
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
    wait_for_selector("#submit-register-or-login").click
    @wait.until { @driver.page_source.include?("Please check your email to verify your account.") }
    wait_for_selector_none("#submit-register-or-login")
    confirm_email(options[:email])
    sleep 3
  end

  def reset_password(email)
    load
    wait_for_selector('.login__forgot-password a').click
    wait_for_selector('#password-reset-email-input').send_keys(email)
    wait_for_selector('.user-password-reset__actions button + button').click
    wait_for_selector_none("#password-reset-email-input")
  end

  def login_with_email(options)
    load
    toggle_form_mode unless form_mode == 'login'

    fill_input('.login__email input', options[:email])
    fill_input('.login__password input', options[:password])
    # TODO: fix or remove click_button() for mobile browsers
    (@wait.until { @driver.find_element(:xpath, "//button[@id='submit-register-or-login']") }).click

    wait_for_selector('.home')
    return CreateTeamPage.new(config: @config, driver: @driver) if contains_element?('.create-team', {timeout: 1})
    return ProjectPage.new(config: @config, driver: @driver) if contains_element?('.project')
    return ProjectPage.new(config: @config, driver: @driver) if options[:project]
  end

  def login_with_facebook
    @driver.navigate.to 'https://www.facebook.com'
    wait_for_selector('#email').send_keys(@config['facebook_user'])
    wait_for_selector('#pass').send_keys(@config['facebook_password'])
    click_button('#loginbutton input')
    sleep 2

    @driver.navigate.to url
    click_button('#facebook-login')
    sleep 3

    window = @driver.window_handles.first
    @driver.switch_to.window(window)
    sleep 20
    agree_to_tos
    wait_for_selector('.home')
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
