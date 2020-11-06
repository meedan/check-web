shared_examples 'project' do

  it "should redirect to last visited project", bin3: true do
    user = api_register_and_login_with_email
    api_create_team_and_project(user: user)
    api_create_team_and_project(user: user)

    @driver.navigate.to(@config['self_url'] + '/check/me')
    wait_for_selector('#teams-tab').click
    wait_for_selector(".switch-teams__joined-team")
    wait_for_selector_list('.teams a').first.click
    wait_for_selector(".project__title")
    wait_for_selector(".project-list__link-trash")
    wait_for_selector(".project__title")
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector('.project-list__link').click
    wait_for_selector_none(".team-members__edit-button", :css, 10)

    @driver.navigate.to(@config['self_url'] + '/check/me')
    wait_for_selector('#teams-tab').click
    wait_for_selector(".switch-teams__joined-team")
    wait_for_selector_list('.teams a').last.click
    wait_for_selector(".project__title")
    wait_for_selector(".project-list__link-trash")
    wait_for_selector(".team-header__drawer-team-link").click

    @driver.navigate.to(@config['self_url'])
    wait_for_selector('.project__title')
    notfound = @config['self_url'] + '/check/404'
    expect(@driver.current_url.to_s == notfound).to be(false)
  end


  it "should show: edit project (link only to users with update project permission)", bin3: true do
    utp = api_create_team_project_and_two_users
    @driver.navigate.to (@config['api_path'] + '/test/session?email='+utp[:user1]["email"])
    @driver.navigate.to (@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
    wait_for_selector("#search-form")
    expect(wait_for_selector_list('.project-actions').length == 1).to be(true)
    @driver.navigate.to (@config['api_path'] + '/test/session?email='+utp[:user2]["email"])
    @driver.navigate.to (@config['self_url'] + '/'+utp[:team]["slug"]+'/project/'+utp[:project]["dbid"].to_s)
    wait_for_selector("#search-form")
    wait_for_selector_none('.project-actions')
    expect(@driver.find_elements(:class, "project-actions").length == 0).to be(true)
  end

  it "should create a project for a team", bin3: true do
    api_create_team
    @driver.navigate.to @config['self_url']
    project_name = "Project #{Time.now}"
    create_project(project_name)
    expect(@driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
    wait_for_selector('.team-header__drawer-team-link').click
    element = wait_for_selector('.team__project-title')
    expect(element.text == project_name).to be(true)
  end

  it "should edit project", bin4: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    new_title = "Changed title #{Time.now.to_i}"
    new_description = "Set description #{Time.now.to_i}"
    expect(@driver.page_source.include?(new_title)).to be(false)
    expect(@driver.page_source.include?(new_description)).to be(false)
    #7204 edit title and description separately
    edit_project(title: new_title, description: "")
    expect(@driver.page_source.include?("Changed title")).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(false)
    wait_for_selector('.project-actions', :css)
    #7204 edit title and description separately
    edit_project(description: new_description)
    expect(@driver.page_source.include?("Changed title")).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(true)
  end

  it "should assign and delete project", bin3: true do
    user = api_register_and_login_with_email
    api_create_team_and_project(user: user)
    @driver.navigate.to(@config['self_url'] + '/check/me')
    wait_for_selector('#teams-tab').click
    wait_for_selector('.teams a').click
    wait_for_selector('a[href$="/all-items"]')
    wait_for_selector(".project-list__link-trash")
    wait_for_selector(".project__title")
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector(".team__primary-info")
    expect(@driver.page_source.include?('Assigned to one member')).to be(false)
    ['.team__project-expand', '.project__assignment-button', '.project__assignment-menu input[type=checkbox]', '.multi__selector-save'].each do |selector|
      wait_for_selector(selector).click
    end
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Assigned to one member')).to be(true)
    wait_for_selector(".project-list__link").click
    wait_for_selector(".project-actions__icon").click
    wait_for_selector(".project-actions__destroy").click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.message')
    expect(@driver.find_elements(:css, '.project-list__link').length == 0 )
  end

  it "should paginate project page", bin4: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page 21, 0
    wait_for_selector(".search__results-heading")
    wait_for_selector('.media__heading')
    wait_for_selector("//span[contains(text(), '1 - 20 / 21')]", :xpath)
    expect(@driver.page_source.include?('1 - 20 / 21')).to be(true)
    wait_for_selector(".search__next-page").click
    wait_for_selector(".search__results-heading")
    wait_for_selector('.media__heading')
    wait_for_selector("//span[contains(text(), '21 - 21 / 21')]", :xpath)
    expect(@driver.page_source.include?('21 - 21 / 21')).to be(true)
  end
end