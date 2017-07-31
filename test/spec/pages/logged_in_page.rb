require_relative './login_page.rb'

module LoggedInPage
  def logout
    menu = element('.header-actions__menu-toggle')
    menu.click

    # Wait for menu transition to complete
    sleep 2
    logout = element('.header-actions__menu-item--logout')
    logout.click

    wait_for_element('#login-container')
    LoginPage.new(config: @config, driver: @driver)
  end

  def logout_and_close
    logout
    close
  end
end
