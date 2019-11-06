require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './api_helpers.rb'

shared_examples 'smoke' do

  include AppSpecHelpers
  include ApiHelpers
  
  it "should sign up using e-mail", bin5: true, quick:true do
    @driver.navigate.to @config['self_url']
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(false)
    email = 'userTest+' + Time.now.to_i.to_s + '@email.com'
    register_with_email(false, email, false)
    wait_for_selector(".message")
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(true)
  end
  

end









