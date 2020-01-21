require_relative './login_page.rb'

module LoggedInPage
  def logout
    wait_for_selector(".project-header__back-button").click
    avatar = wait_for_selector(".avatar")
    avatar.click
    logout = element('.user-menu__logout')
    logout.click
    wait_for_element('#login-container')
    LoginPage.new(config: @config, driver: @driver)
  end

  def logout_and_close
    logout
    close
  end
end
