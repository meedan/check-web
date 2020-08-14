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

  private

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
