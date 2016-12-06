require_relative './page.rb'
require_relative './project_page.rb'
require_relative './create_team_page.rb'

class LoginPage < Page
  def url
    @config['self_url']
  end

  def register_and_login_with_email(options)
    register_with_email(options)
    load
    login_with_email(options)
  end

  def register_with_email(options)
    email_button.click
    toggle_email_mode unless email_mode == 'register'

    fill_input('.login-email__name input', 'User With Email')
    fill_input('.login-email__email input', options[:email])
    fill_input('.login-email__password input', options[:password])
    fill_input('.login-email__password-confirmation input', options[:password])
    fill_input('input[type=file]', options[:file], { hidden: true }) if options[:file]
    click_button('#submit-register-or-login')

    @wait.until { @driver.page_source.include?("You have to confirm your email address before continuing.") }
    confirm_email(options[:email])
  end

  def login_with_email(options)
    email_button.click
    toggle_email_mode unless email_mode == 'login'

    fill_input('.login-email__email input', options[:email])
    fill_input('.login-email__password input', options[:password])
    click_button('#submit-register-or-login')

    wait_for_element('.home')
    return CreateTeamPage.new(config: @config, driver: @driver) if contains_element?('.create-team')
    return ProjectPage.new(config: @config, driver: @driver) if contains_element?('.project')
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
    wait_for_element('.home')
  end

  private

  def email_button
    @wait.until { @driver.find_element(:xpath, "//a[@id='login-email']") }
  end

  def email_mode
    (@wait.until { @driver.find_element(:css, '.login-email__form') }).attribute('name')
  end

  def toggle_email_mode
    (@wait.until { @driver.find_element(:xpath, "//button[@id='register-or-login']") }).click
  end

  def confirm_email(email) # TODO: test real email confirmation flow
    request_api('/test/confirm_user', { email: email })
  end
end
