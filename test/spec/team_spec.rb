shared_examples 'team' do
  it 'should be able to find a team after signing up', bin3: true do
    api_register_and_login_with_email
    @driver.navigate.to @config['self_url']
    wait_for_selector('.find-team-card')
    expect(@driver.page_source.include?('Find an existing workspace')).to be(true)

    # return error for non existing team
    fill_field('#team-slug-container', 'non-existing-slug')
    wait_for_selector('.find-team__submit-button').click
    wait_for_selector('.find-team-card')
    expect(@driver.page_source.include?('Workspace not found!')).to be(true)

    # redirect to /team-slug/join if team exists
    # /team-slug/join in turn redirects to team page because already member
    @driver.navigate.to "#{@config['self_url']}/check/teams/new"
    wait_for_selector('.create-team__submit-button')
    team = "existing-team-#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/check/teams/find"
    wait_for_selector('.find-team__form')
    fill_field('#team-slug-container', team)
    wait_for_selector('.find-team__submit-button').click
    wait_for_selector('.team__primary-info')
    expect(@driver.page_source.include?(team)).to be(true)
  end

  it 'should show teams at /check/teams', bin1: true do
    api_create_team
    @driver.navigate.to "#{@config['self_url']}/check/teams"
    wait_for_selector('teams', :class)
    expect(@driver.find_elements(:css, '.teams').empty?).to be(false)
  end

  it 'should cancel request through switch teams', bin1: true do
    user = api_register_and_login_with_email
    t1 = api_create_team(user: user)
    t2 = api_create_team(user: user)
    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('.source__primary-info')
    select_team(name: t1.name)
    wait_for_selector('.team-menu__edit-team-button')
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq(t1.name)
    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('.source__primary-info')
    select_team(name: t2.name)
    wait_for_selector('.team-menu__edit-team-button')
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq(t2.name)
  end

  it 'should edit team and logo', bin1: true do
    team = "testteam#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}"
    wait_for_selector('team-menu__edit-team-button', :class)
    expect(@driver.page_source.include?('Rome')).to be(false)
    expect(@driver.page_source.include?('www.meedan.com')).to be(false)
    expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(false)
    expect(@driver.page_source.include?(' - EDIT')).to be(false)

    wait_for_selector('.team-menu__edit-team-button').click

    wait_for_selector('#team__name-container').click
    wait_for_selector('#team__name-container').send_keys(' - EDIT')

    wait_for_selector('#team__description-container').click
    wait_for_selector('#team__description-container').send_keys 'EDIT DESCRIPTION'

    wait_for_selector('#team__location-container').click
    wait_for_selector('#team__location-container').send_keys 'Rome'

    wait_for_selector('#team__phone-container').click
    wait_for_selector('#team__phone-container').send_keys '555199889988'

    wait_for_selector('#team__link-container').click
    wait_for_selector('#team__link-container').send_keys 'www.meedan.com'

    # Logo
    wait_for_selector('.team__edit-avatar-button').click

    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))

    wait_for_selector('.source__edit-save-button').click
    wait_for_selector('.team__primary-info')
    expect(@driver.page_source.include?('Rome')).to be(true)
    expect(@driver.page_source.include?('www.meedan.com')).to be(true)
    expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(true)
    expect(@driver.page_source.include?(' - EDIT')).to be(true)
  end

  it 'should install and uninstall bot', bin5: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}/settings/integrations"
    wait_for_selector('.team-bots__keep-uninstalled').click
    wait_for_selector('.team-bots__keep-installed').click
  end

  it 'should add introduction to team report settings', bin5: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__report-tab').click
    wait_for_selector('#use_introduction').click
    expect(@driver.page_source.include?('Report settings saved successfully')).to be(false)
    expect(@driver.page_source.include?('The content you set here can be edited in each individual report')).to be(true)
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
    wait_for_selector('#slack-config__channel')
    wait_for_selector("//span[contains(text(), 'Send notifications to Slack channels')]", :xpath)
    wait_for_selector('#slack-config__webhook').send_keys('https://hooks.slack.com/services/00000/0000000000')
    wait_for_selector('.slack-config__save').click
    wait_for_selector_none('.slack-config__save')
    @driver.navigate.refresh
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector("//span[contains(text(), 'Slack')]", :xpath)
    wait_for_selector('.Mui-checked')
    expect(@driver.find_elements(:css, '.Mui-checked').length == 1)
    wait_for_selector('.slack-config__settings').click
    wait_for_selector('#slack-config__webhook')
    expect(@driver.page_source.include?('hooks.slack.com/services')).to be(true)
  end

  it 'should manage team members', bin4: true, quick: true do
    # setup
    @user_mail = "test#{Time.now.to_i}#{rand(9999)}#{@user_mail}"
    @team1_slug = "team1#{Time.now.to_i}#{rand(9999)}"
    user = api_register_and_login_with_email(email: @user_mail, password: @password)
    team = request_api 'team', { name: 'Team 1', email: user.email, slug: @team1_slug }
    request_api 'project', { title: 'Team 1 Project', team_id: team.dbid }
    team = request_api 'team', { name: 'Team 2', email: user.email, slug: "team-2-#{rand(9999)}#{Time.now.to_i}" }
    request_api 'project', { title: 'Team 2 Project', team_id: team.dbid }

    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('.source__primary-info')
    select_team(name: 'Team 1')

    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team 1')
    expect(wait_for_selector('.project-list__link').text.include?('Team 1 Project')).to be(true)
    expect(wait_for_selector('.project-list__link').text.include?('Team 2 Project')).to be(false)

    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('.source__primary-info')
    select_team(name: 'Team 2')

    wait_for_selector('.team__primary-info')
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team 2')
    expect(wait_for_selector('.project-list__link').text.include?('Team 1 Project')).to be(false)
    expect(wait_for_selector('.project-list__link').text.include?('Team 2 Project')).to be(true)

    # As a different user, request to join one team and be accepted.
    api_register_and_login_with_email(email: "new#{@user_mail}", password: @password)
    ask_join_team(subdomain: @team1_slug)
    @wait.until do
      expect(@driver.find_element(:class, 'message').nil?).to be(false)
    end
    api_logout
    @driver.quit

    @driver = new_driver
    # As the group creator, go to the members page and approve the joining request.
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{@user_mail}")
    approve_join_team(subdomain: @team1_slug)
    count = 0
    elems = @driver.find_elements(css: '.team-members__member')
    while elems.size <= 1 && count < 15
      sleep 5
      count += 1
      elems = @driver.find_elements(css: '.team-members__member')
    end
    expect(elems.size).to be > 1

    # Edit team member role
    change_the_member_role_to('li.role-journalist')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'journalist'

    # # "should redirect to team page if user asking to join a team is already a member"
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}/join"
    wait_for_selector('.team__primary-info')
    @wait.until do
      expect(@driver.current_url.eql?("#{@config['self_url']}/#{@team1_slug}")).to be(true)
    end

    # # "should reject member to join team"
    api_register_and_login_with_email
    ask_join_team(subdomain: @team1_slug)
    @wait.until do
      expect(@driver.find_element(:class, 'message').nil?).to be(false)
    end
    api_logout
    @driver.quit

    @driver = new_driver
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{@user_mail}")
    disapprove_join_team(subdomain: @team1_slug)
    @driver.navigate.refresh
    wait_for_selector('.team-header__drawer-team-link')
    expect(@driver.page_source.include?('Requests to join')).to be(false)

    # # "should delete member from team"
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}"
    wait_for_selector('.team-members__member')
    wait_for_selector('.team-members__edit-button').click

    l = wait_for_selector_list_size('team-members__delete-member', 2, :class)
    old = l.length
    expect(old > 1).to be(true)
    l.last.click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__checkbox')
    new = wait_for_size_change(l.length, 'team-members__delete-member', :class)
    expect(new < old).to be(true)
  end

  it 'should check user permissions', bin5: true do
    # setup
    @user_mail = "test#{Time.now.to_i}#{rand(9999)}#{@user_mail}"
    @team1_slug = "team1#{Time.now.to_i}#{rand(9999)}"
    user = api_register_and_login_with_email(email: @user_mail, password: @password)
    team = request_api 'team', { name: 'Team', email: user.email, slug: @team1_slug }
    request_api 'project', { title: 'Team Project', team_id: team.dbid }
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}"
    wait_for_selector('.team__primary-info')
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team')
    expect(wait_for_selector('.project-list__link').text.include?('Team Project')).to be(true)
    api_logout
    # As a different user, request to join one team and be accepted.
    api_register_and_login_with_email(email: "new#{@user_mail}", password: @password) # user2
    ask_join_team(subdomain: @team1_slug)
    @wait.until do
      expect(@driver.find_element(:class, 'message').nil?).to be(false)
    end
    api_logout
    @driver.quit
    @driver = new_driver
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{@user_mail}")
    # As the group creator, go to the members page and approve the joining request.
    approve_join_team(subdomain: @team1_slug)
    count = 0
    elems = @driver.find_elements(css: '.team-members__member')
    while elems.size <= 1 && count < 15
      sleep 5
      count += 1
      elems = @driver.find_elements(css: '.team-members__member')
    end
    expect(elems.size).to be > 1
    # edit team member role
    change_the_member_role_to('li.role-journalist')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'journalist'

    # create one media
    wait_for_selector('.project-list__link', index: 0).click
    create_media('one item')
    wait_for_selector_list_size('.medias__item', 1)
    expect(@driver.page_source.include?('one item')).to be(true)

    # As a different user, request to join one team
    api_register_and_login_with_email(email: "one_more#{@user_mail}", password: @password) # user3
    ask_join_team(subdomain: @team1_slug)
    @wait.until do
      expect(@driver.find_element(:class, 'message').nil?).to be(false)
    end
    api_logout
    @driver.quit
    # log in as  the journalist
    @driver = new_driver
    @driver.navigate.to("#{@config['api_path']}/test/session?email=new#{@user_mail}")

    # go to the members page and can't see the request to join the another user
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}"
    wait_for_selector('.team-members__list')
    expect(@driver.page_source.include?('Requests to join')).to be(false)

    # go to the project that you don't own and can't see the actions icon
    wait_for_selector('.project-list__link', index: 0).click
    wait_for_selector_none('.project-actions__icon') # actions icon
    expect(@driver.find_elements(:css, '.project-actions__icon').size).to eq 0

    # create media in a project that you don't own
    expect(@driver.page_source.include?('new item')).to be(false)
    create_media('new item')
    wait_for_selector_list_size('.medias__item', 2)
    expect(@driver.page_source.include?('new item')).to be(true)

    # see the icon 'change the status' that the media you don't own
    wait_for_selector_list('.medias__item')[1].click
    wait_for_selector('.media-detail')
    expect(@driver.find_elements(:css, '.media-status button').size).to eq 1

    # see the input to add a comment in media you don't own
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.add-annotation__buttons')
    expect(@driver.find_elements(:css, '#cmd-input').size).to eq 1

    # try edit team and can't see the button 'edit team button'
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__tags-tab')
    expect(@driver.find_elements(:css, '.team-menu__edit-team-button').size).to eq 0

    api_logout
    @driver.quit

    # log in as the group creator
    @driver = new_driver
    @driver.navigate.to("#{@config['api_path']}/test/session?email=#{@user_mail}")

    # go to the members page and edit team member role to 'contribuitor'
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}"
    # edit team member role
    change_the_member_role_to('li.role-contributor')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'contributor'

    api_logout
    @driver.quit

    # log in as the contributor
    @driver = new_driver
    @driver.navigate.to("#{@config['api_path']}/test/session?email=new#{@user_mail}")

    # can't see the link 'edit member roles'
    @driver.navigate.to "#{@config['self_url']}/#{@team1_slug}"
    expect(@driver.find_elements(:css, '.team-members__edit-button').size).to eq 0

    # can't see the link 'create a new list'
    expect(@driver.find_elements(:css, '.create-project-card').size).to eq 0

    # go to the project and can't see the icon 'change the status' that the media you don't own
    wait_for_selector('.project-list__link', index: 0).click
    wait_for_selector('.medias__item', index: 1).click
    wait_for_selector('.media-detail')
    expect(@driver.find_elements(:css, '.media-status button[disabled]').size).to eq 1
  end

  it 'should go back to previous team', bin1: true do
    user = api_register_and_login_with_email
    t1 = api_create_team(user: user)
    t2 = api_create_team(user: user)

    # Go to first team
    @driver.navigate.to "#{@config['self_url']}/#{t1.slug}/all-items"
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/\"]")

    # Navigate to second team
    wait_for_selector('.header__user-menu').click
    wait_for_selector('a[href="/check/me"]').click
    wait_for_selector('#teams-tab').click
    wait_for_selector("#switch-teams__link-to-#{t2.slug}").click
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t2.slug}/\"]")

    # Navigate back to first team
    wait_for_selector('.header__user-menu').click
    wait_for_selector('a[href="/check/me"]').click
    wait_for_selector('#teams-tab').click
    wait_for_selector("#switch-teams__link-to-#{t1.slug}").click
    wait_for_selector(".team-header__drawer-team-link[href=\"/#{t1.slug}/\"]")
  end
end
