require_relative './spec_helper.rb'

shared_examples 'quicktest_status' do
  #Set a verification status to this media.
  it "should change a media status via the dropdown menu" do
    media_pg = LoginPage.new(config: @config, driver: @driver).load
        .login_with_email(email: @e1, password: @password, project: true)
    @driver.navigate.to team_url('project/' + get_project + '/media/' + $media_id)
    sleep 3
    element = @driver.find_element(:css, ".media-status__label")
    element.click
    element = @driver.find_element(:css, ".media-status__menu-item--verified")
    element.click
    sleep 3
    element = @driver.find_element(:css, '.annotation__status--verified')
    expect(element.nil?).to be(false)
  end
end
