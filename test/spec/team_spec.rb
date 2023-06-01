shared_examples 'team' do
  it 'should duplicate team', bin1: true do
    team = "testteam#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}/settings/workspace"
    wait_for_selector('#team-details__update-button')
    expect(@driver.page_source.include?('duplicated-team')).to be(false)
    wait_for_selector('#team-details__duplicate-button').click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    update_field('#create-team-dialog__name-input', "duplicated-team#{Time.now.to_i}")
    wait_for_selector('.create-team-dialog__confirm-button').click
    wait_for_selector_none('.create-team-dialog__confirm-button')
    expect(@driver.page_source.include?('duplicated-team')).to be(true)
  end

  it 'should edit team and logo', bin1: true do
    team = "testteam#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}"
    wait_for_selector('#team-details__update-button')
    wait_for_selector('.team-settings__workspace-tab').click
    expect(@driver.page_source.include?(' - EDIT')).to be(false)
    wait_for_selector('#team-details__name-input').send_keys(' - EDIT')

    # Logo
    wait_for_selector('#team-details__edit-avatar-button').click

    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'files/test.png'))

    wait_for_selector('#team-details__update-button').click

    wait_for_selector('.message')
    expect(@driver.page_source.include?('Workspace details saved successfully')).to be(true)

    @driver.navigate.refresh
    wait_for_selector('#team-details__update-button')
    expect(@driver.page_source.include?(' - EDIT')).to be(true)
  end

  it 'should install and uninstall bot', bin6: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}/settings/integrations"
    wait_for_selector('.team-bots__keep-uninstalled').click
    wait_for_selector('.team-bots__keep-installed').click
  end

  it 'should add introduction to team report settings', bin4: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    api_install_bot 'smooch'
    wait_for_selector('.team-settings__report-tab').click
    wait_for_selector('#use_introduction').click
    expect(@driver.page_source.include?('Report settings saved successfully')).to be(false)
    wait_for_selector('#introduction').send_keys('introduction text')
    wait_for_selector('#team-report__save').click
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Report settings saved successfully')).to be(true)
  end

  it 'should enable the Slack notifications', bin5: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    @driver.execute_script('window.scrollTo(10, 10000)')
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector("//span[contains(text(), 'Slack')]", :xpath)
    expect(@driver.find_elements(:css, '.Mui-checked').empty?)
    @driver.execute_script('window.scrollTo(10, 10000)')
    wait_for_selector('.slack-config__switch').click
    wait_for_selector('.Mui-checked')
    wait_for_selector('.slack-config__settings').click
    wait_for_selector('div[role=dialog]')
    wait_for_selector('#slack-config__webhook').send_keys('https://hooks.slack.com/services/00000/0000000000')
    wait_for_selector('.slack-config__save').click
    wait_for_selector_none('.slack-config__save')
    @driver.navigate.refresh
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector("//span[contains(text(), 'Slack')]", :xpath)
    @driver.execute_script('window.scrollTo(10, 10000)')
    wait_for_selector('.Mui-checked')
    expect(@driver.find_elements(:css, '.Mui-checked').length == 1)
    wait_for_selector('.slack-config__settings').click
    wait_for_selector('#slack-config__webhook')
    expect(@driver.page_source.include?('hooks.slack.com/services')).to be(true)
  end

  it 'should manage user permissions', bin5: true do
    utp = api_create_team_project_and_two_users
    user_editor = api_create_and_confirm_user
    api_add_team_user(email: user_editor.email, slug: utp[:team]['slug'], role: 'editor')
    # log in as admin
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user1]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__link').click
    create_media('text')
    api_logout

    # log in as colaborator
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user2]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}/settings/members")
    wait_for_selector('button#team-members__invite-button')
    # do not be able to invite a member
    expect(@driver.find_elements(:css, 'button#team-members__invite-button[disabled=""]').length == 1)
    # do not be able to duplicate or edit workspace detail
    wait_for_selector('.team-settings__workspace-tab').click
    wait_for_selector('#team-details__name-input')
    expect(@driver.find_elements(:css, 'button#team-details__update-button[disabled=""]').length == 1)
    expect(@driver.find_elements(:css, 'button#team-details__duplicate-button[disabled=""]').length == 1)
    # do not be able to add, remove or edit a new folder
    expect(@driver.find_elements(:css, '.projects-list__add-folder-or-collection').empty?).to be(true)
    # do not be able to see project actions button
    wait_for_selector('.project-list__link').click
    wait_for_selector('#search-form')
    expect(@driver.find_elements(:css, '.project-actions').empty?).to be(true)
    api_logout

    # log in as editor
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{user_editor.email}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}/settings/members")
    wait_for_selector('button#team-members__invite-button')
    # be able to invite a member
    expect(@driver.find_elements(:css, 'button#team-members__invite-button[disabled=""]').length.zero?).to be(true)
    # be able to edit workspace detail
    wait_for_selector('.team-settings__workspace-tab').click
    wait_for_selector('#team-details__name-input')
    expect(@driver.find_elements(:css, 'button#team-details__update-button[disabled=""]').length.zero?).to be(true)
    # do not be able to duplicate team
    expect(@driver.find_elements(:css, 'button#team-details__duplicate-button[disabled=""]').length == 1)
    wait_for_selector('.team-header__drawer-team-link').click
    # be able to see folder actions icon
    wait_for_selector('.project-list__link').click
    wait_for_selector('#search-form')
    expect(@driver.find_elements(:css, '.project-actions').empty?).to be(false)
    # be able to create a folder
    expect(@driver.find_elements(:css, 'button.projects-list__add-folder-or-collection').length == 1)
  end

  it 'should go back to previous team', bin1: true do
    user = api_register_and_login_with_email
    t1 = api_create_team(user: user)
    t2 = api_create_team(user: user)

    # Go to first team
    @driver.navigate.to "#{@config['self_url']}/#{t1.slug}/all-items"
    wait_for_selector('#add-filter-menu__open-button')
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/settings/workspace\"]")

    # Navigate to second team
    wait_for_selector('.header__user-menu')
    wait_for_selector('.user-menu__role').click
    wait_for_selector('.user-menu__logout')
    wait_for_selector('a[href="/check/me"]').click
    wait_for_selector('.source__primary-info')
    wait_for_selector('#teams-tab').click
    wait_for_selector("#switch-teams__link-to-#{t2.slug}").click
    wait_for_selector('#add-filter-menu__open-button')
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t2.slug}/settings/workspace\"]")

    # Navigate back to first team
    wait_for_selector('.header__user-menu')
    wait_for_selector('.user-menu__role').click
    wait_for_selector('.user-menu__logout')
    wait_for_selector('a[href="/check/me"]').click
    wait_for_selector('.source__primary-info')
    wait_for_selector('#teams-tab').click
    wait_for_selector("#switch-teams__link-to-#{t1.slug}").click
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/settings/workspace\"]")
  end

  it 'should manage folder access', bin1: true do
    utp = api_create_team_project_and_two_users
    user_editor = api_create_and_confirm_user
    api_add_team_user(email: user_editor.email, slug: utp[:team]['slug'], role: 'editor')
    # log in as colaborator and be able to see the folder
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user2]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    expect(@driver.find_elements(:css, '.project-list__link').length).to eq 2
    api_logout

    # log in as editor and be able to see the folder
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{user_editor.email}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    expect(@driver.find_elements(:css, '.project-list__link').length).to eq 2
    api_logout

    # log in as admin and change folder acess to Only admins and Editors
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user1]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    wait_for_selector('.project-list__link').click
    change_folder_access
    api_logout

    # log in as colaborator and do not be able to see the folder
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user2]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    expect(@driver.find_elements(:css, '.project-list__link').length).to eq 1
    api_logout

    # log in as admin and change folder acess to Only admins
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{utp[:user1]['email']}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    wait_for_selector('.project-list__link').click
    change_folder_access
    api_logout

    # log in as editor and do not be able to see the folder
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{user_editor.email}")
    @driver.navigate.to("#{@config['self_url']}/#{utp[:team]['slug']}")
    wait_for_selector('.component__settings-header')
    wait_for_selector('.project-list__header')
    expect(@driver.find_elements(:css, '.project-list__link').length).to eq 1
    api_logout
  end
end