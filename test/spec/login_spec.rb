shared_examples 'login' do
  it 'should sign up using e-mail', bin5: true do
    @driver.navigate.to @config['self_url']
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(false)
    email = "userTest+#{Time.now.to_i}@email.com"
    register_with_email(false, email, false)
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(true)
  end

  it 'should register and login using e-mail', bin5: true, quick: true do
    email = "sysops+#{Time.now.to_i}@meedan.com"
    register_with_email(true, email, true)
    @driver.navigate.to "#{@config['self_url']}/check/me"
    displayed_name = wait_for_selector('h1.source__name').text
    expect(displayed_name == 'User With Email').to be(true)
  end

  it 'should invite a user by e-mail to join team', bin6: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}"
    wait_for_selector('#team-members__invite-button').click
    wait_for_selector('#invite-dialog__email-input').send_keys('user-email@email.com')
    wait_for_selector('#invite-dialog__submit').click
    wait_for_selector_list_size('.team-members__user-row', 2)
    expect(@driver.page_source.include?('user-email@email.com')).to be(true)
    expect(@driver.page_source.include?('Pending')).to be(true)
  end

  it 'should not reset password', bin5: true do
    @driver.navigate.to @config['self_url']
    reset_password('test@meedan.com')
    wait_for_selector_none('.user-password-reset__email-input')
    send_msg = wait_for_selector('.user-password-reset__sent_password').text
    expect(send_msg.include?('If this email exists, you will receive an email to reset your password')).to be(true)
  end

  it 'should redirect to login page if not logged in and team is private', bin4: true do
    t = api_create_team(private: true, user: OpenStruct.new(email: 'anonymous@test.test'))
    @driver.navigate.to "#{@config['self_url']}/#{t.slug}/all-items"
    wait_for_selector('.login__form')
    expect(@driver.page_source.include?('Sign in')).to be(true)
  end

  it 'should logout', bin5: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    logout
    expect(@driver.page_source.include?('Sign in')).to be(true)
  end

  it 'should reset password', bin5: true do
    user = api_create_and_confirm_user
    api_logout
    @driver.quit
    @driver = new_driver
    @driver.navigate.to @config['self_url']
    wait_for_selector('.login__forgot-password a').click
    wait_for_selector('#password-reset-email-input').send_keys(user.email)
    wait_for_selector('.user-password-reset__actions button + button').click
    wait_for_selector_none('.user-password-reset__email-input')
    send_msg = wait_for_selector('.user-password-reset__sent_password').text
    expect(send_msg.include?('If this email exists, you will receive an email to reset your password')).to be(true)
  end
end
