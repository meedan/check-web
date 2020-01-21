require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './api_helpers.rb'

shared_examples 'smoke' do

  include AppSpecHelpers
  include ApiHelpers

#Login section Start
  it "should sign up using e-mail", bin2: true do
    @driver.navigate.to @config['self_url']
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(false)
    email = 'userTest+' + Time.now.to_i.to_s + '@email.com'
    register_with_email(false, email, false)
    wait_for_selector(".message")
    expect(@driver.page_source.include?('Please check your email to verify your account')).to be(true)
  end

  it "should login using Facebook", bin5: true, quick:true do
    login_pg = LoginPage.new(config: @config, driver: @driver).load
    login_pg.login_with_facebook
    me_pg = MePage.new(config: @config, driver: login_pg.driver).load
    displayed_name = me_pg.title
    expected_name = @config['facebook_name']
    expect(displayed_name).to eq(expected_name)
  end

  it "should login using Twitter", bin5: true, quick: true do
    login_with_twitter
    @driver.navigate.to @config['self_url'] + '/check/me'
    wait_for_selector("#assignments-tab")
    displayed_name = wait_for_selector('h1.source__name').text.upcase
    expected_name = @config['twitter_name'].upcase
    expect(displayed_name == expected_name).to be(true)
  end

  it "should login using Slack", bin4: true, quick:true do
    login_with_slack
    @driver.navigate.to @config['self_url'] + '/check/me'
    displayed_name = wait_for_selector('h1.source__name').text.upcase
    expected_name = @config['slack_name'].upcase
    expect(displayed_name == expected_name).to be(true)
  end

  it "should register and login using e-mail", bin5: true, quick:true do
    login_pg = LoginPage.new(config: @config, driver: @driver).load
    email, password = ['sysops+' + Time.now.to_i.to_s + '@meedan.com', '22345678']
    login_pg.register_and_login_with_email(email: email, password: password)
    me_pg = MePage.new(config: @config, driver: login_pg.driver).load # reuse tab
    displayed_name = me_pg.title
    expect(displayed_name == 'User With Email').to be(true)
  end
# Login section end

#security section start
  it "should reset password", bin5: true do
    user = api_create_and_confirm_user
    page = LoginPage.new(config: @config, driver: @driver)
    page.reset_password(user.email)
    wait_for_selector_none(".user-password-reset__email-input")
    expect(@driver.page_source.include?('email was not found')).to be(false)
    expect(@driver.page_source.include?('Password reset sent')).to be(true)
  end

#security section end

#media items section start
  it "should create a new media using a link from Facebook", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
    wait_for_selector(".media-detail")
    wait_for_selector("iframe")
    expect(@driver.page_source.include?('First Draft')).to be(true)
  end

  it "should create a new media using a link from Twitter", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/TheWho/status/890135323216367616')
    wait_for_selector(".media-detail")
    wait_for_selector("iframe")
    expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)
  end

  it "should create a new media using a link from Youtube", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
    wait_for_selector(".media-detail")
    wait_for_selector("iframe")
    expect(@driver.page_source.include?("How To Check An Account's Authenticity")).to be(true)
  end

  it "should create a new media using a link from Instagram", bin3: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.instagram.com/p/BRYob0dA1SC/')
    wait_for_selector(".media-detail")
    wait_for_selector("iframe")
    expect(@driver.page_source.include?('#wEDnesday')).to be(true)
  end

  it "should register and create a claim", bin4: true do
    page = LoginPage.new(config: @config, driver: @driver).load
    page = page.register_and_login_with_email(email: "sysops+#{Time.now.to_i}#{rand(1000)}@meedan.com", password: @password)
    page
      .create_team
      .create_project
      .create_media(input: 'Claim')
      .logout
  end

  it "should lock and unlock status", bin2: true do
    page = api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    wait_for_selector('.annotation--verification_status')
    expect(@driver.page_source.include?('Item status locked by')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_size_change(1, '.annotation--verification_status')
    expect(@driver.page_source.include?('Item status unlocked by')).to be(true)
  end

  it "should comment media as a command", bin2: true, quick:true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.create-task__add-button')
    # First, verify that there isn't any comment
    expect(@driver.page_source.include?('This is my comment')).to be(false)
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = wait_for_selector_list('.annotations__list-item')

    # Add a comment as a command
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    fill_field('#cmd-input', '/comment This is my comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".annotation__card-content")
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    wait_for_size_change(old,'.annotations__list-item')

    # Verify that comment was added to annotations list
    expect(@driver.page_source.include?('This is my comment')).to be(true)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    wait_for_selector('.annotation__card-text')
    expect(@driver.page_source.include?('This is my comment')).to be(true)
  end

  it "should add image to media comment", bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    # First, verify that there isn't any comment with image
    expect(@driver.page_source.include?('This is my comment with image')).to be(false)
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = @driver.find_elements(:class, "annotations__list-item").length
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    # Add a comment as a command
    fill_field('#cmd-input', 'This is my comment with image')
    el = wait_for_selector('.add-annotation__insert-photo')
    el.click
    wait_for_selector('input[type=file]')
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector('.add-annotation__buttons button').click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    wait_for_size_change(old, "annotations__list-item", :class)

    # Verify that comment was added to annotations list
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)

    # Zoom image
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)
    el = wait_for_selector('.annotation__card-thumbnail')
    el.click

    wait_for_selector('.ril-close')
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(false)
    @driver.action.send_keys(:escape).perform
    @wait.until {@driver.find_elements(:css, '.ril-close').length == 0 }
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    wait_for_selector('add-annotation__buttons', :class)
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)
  end
#media items section end

#tasks section start
  it "should manage team tasks", bin6: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    api_create_team(team: team)
    p = Page.new(config: @config, driver: @driver)
    p.go(@config['self_url'] + '/' + team)
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__tasks-tab').click
    wait_for_selector('.team-tasks')
    expect(@driver.page_source.include?('No default tasks to display')).to be(true)
    expect(@driver.page_source.include?('No tasks')).to be(true)
    expect(@driver.page_source.include?('New teamwide task')).to be(false)

    # Create task
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('.create-task__add-short-answer').click
    fill_field('#task-label-input', 'New teamwide task')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector('.team-tasks-project')
    expect(@driver.page_source.include?('No default tasks to display')).to be(false)
    expect(@driver.page_source.include?('1 task')).to be(true)
    expect(@driver.page_source.include?('New teamwide task')).to be(true)

    # Edit task
    wait_for_selector('.team-tasks__menu-item-button').click
    wait_for_selector('.team-tasks__edit-button').click
    fill_field('#task-label-input', '-EDITED')
    wait_for_selector('#edit-task__required-switch').click ;
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none("#confirm-dialog__cancel-action-button")
    expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)
    expect(@driver.find_element(:css, '.task__required').text == '*').to be(true)

    # Delete tag
    wait_for_selector('.team-tasks__menu-item-button').click
    wait_for_selector('.team-tasks__delete-button').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none("#confirm-dialog__cancel-action-button")
    expect(@driver.page_source.include?('No tasks')).to be(true)
    expect(@driver.page_source.include?('New teamwide task')).to be(false)
  end

  it "should add, edit, answer, update answer and delete datetime task", bin3: true do
    media_pg = api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    expect(@driver.page_source.include?('When?')).to be(false)
    expect(@driver.page_source.include?('Task created by')).to be(false)
    old = wait_for_selector_list('annotation__default-content', :class, 25, 'datetime task 1').length
    el = wait_for_selector('.create-task__add-button')
    el.click
    wait_for_selector(".create-task__add-short-answer")
    el = wait_for_selector('.create-task__add-datetime')
    el.click
    fill_field('#task-label-input', 'When?')
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector_none(".create-task__add-short-answer")
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 2')
    expect(@driver.page_source.include?('When?')).to be(true)
    expect(@driver.page_source.include?('Task created by')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Task answered by')).to be(false)
    wait_for_selector(".media__annotations-column > div > div > button").click
    wait_for_selector('.task-type__datetime > div > div > button > div > svg').click
    fill_field('input[name="hour"]', '23')
    fill_field('input[name="minute"]', '59')
    el = wait_for_selector('#task__response-date')
    el.click
    el = wait_for_selector_list('button')
    el.last.click
    el = wait_for_selector('.task__save')
    el.click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 3')
    expect(@driver.page_source.include?('Task answered by')).to be(true)

    # Edit task
    wait_for_selector(".media__annotations-column > div > div > button").click
    wait_for_selector('.task-type__datetime > div > div > button > div > svg').click
    expect(@driver.page_source.include?('When was it?')).to be(false)
    el = wait_for_selector('.task-actions__icon')
    el.click
    el = wait_for_selector(".task-actions__edit")
    @driver.action.move_to(el).perform
    el.click
    wait_for_selector("//textarea[contains(text(), 'When?')]", :xpath)
    update_field('#task-label-input', 'When was it?')
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 4')
    expect(@driver.page_source.include?('When was it?')).to be(true)
    # Edit task response
    wait_for_selector(".media__annotations-column > div > div > button").click
    wait_for_selector('.task-type__datetime > div > div > button > div > svg').click
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(false)
    el = wait_for_selector('.task-actions__icon')
    el.click
    el = wait_for_selector('.task-actions__edit-response')
    el.click
    wait_for_selector('input[name="hour"]').send_keys(:control, 'a', :delete)
    update_field('input[name="hour"]', '12')
    wait_for_selector('input[name="minute"]').send_keys(:control, 'a', :delete)
    update_field('input[name="minute"]', '34')
    el = wait_for_selector('.task__save')
    el.click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 5')
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(true)

    # Delete task
    wait_for_selector(".media__annotations-column > div > div > button").click
    wait_for_selector('.task-type__datetime > div > div > button > div > svg').click
    delete_task('When was it')
  end

  it "should add a comment to a task", bin5: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.create-task__add-button')

    # Create a task
    el = wait_for_selector('.create-task__add-button')
    el.click
    el = wait_for_selector('.create-task__add-short-answer')
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Test')
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    wait_for_selector_list_size(".annotations__list-item", 2)

    wait_for_selector(".media__annotations-column > div > div > button").click
    # Add comment to task
    expect(@driver.page_source.include?('This is a comment under a task')).to be(false)
    wait_for_selector('.task__log-top span').click
    wait_for_selector("#cmd-input")
    fill_field('#cmd-input', 'This is a comment under a task')
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".media__annotations-column > div > div > button + button + button + button").click
    wait_for_selector(".annotation--verification_status")
    expect(@driver.page_source.include?('This is a comment under a task')).to be(true)
  end
#tasks section end

#project section start
  it "should create a project for a team", bin3: true do
    api_create_team
    @driver.navigate.to @config['self_url']
    project_name = "Project #{Time.now}"
    project_pg = TeamPage.new(config: @config, driver: @driver).create_project(name: project_name)
    # create_project(project_name)
    expect(project_pg.driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false)
    wait_for_selector('.team-header__drawer-team-link').click
    element = wait_for_selector('.team__project-title')
    expect(element.text == project_name).to be(true)
  end

  it "should edit project", bin4: true do
    api_create_team_and_project
    project_pg = ProjectPage.new(config: @config, driver: @driver).load
    new_title = "Changed title #{Time.now.to_i}"
    new_description = "Set description #{Time.now.to_i}"
    expect(project_pg.contains_string?(new_title)).to be(false)
    expect(project_pg.contains_string?(new_description)).to be(false)
    #7204 edit title and description separately
    project_pg.edit(title: new_title, description: "")
    expect(@driver.page_source.include?(new_title)).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(false)
    wait_for_selector('.project-actions', :css)
    #7204 edit title and description separately
    project_pg.edit(description: new_description)
    expect(@driver.page_source.include?(new_title)).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(true)
  end

  it "should assign project", bin3: true do
    user = api_register_and_login_with_email
    api_create_team_and_project(user: user)
    @driver.navigate.to(@config['self_url'] + '/check/me')
    wait_for_selector('#teams-tab').click
    wait_for_selector('.teams a').click
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector('.team__project-title')
    expect(@driver.page_source.include?('Assigned to one member')).to be(false)
    ['.team__project button', '.project__assignment-button', '.project__assignment-menu input[type=checkbox]', '.multi__selector-save'].each do |selector|
      wait_for_selector(selector).click
    end
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Assigned to one member')).to be(true)
  end
#project section end

#team section start
  it "should edit team and logo", bin1: true do
    team = "testteam#{Time.now.to_i}"
    api_create_team(team:team)
    p = Page.new(config: @config, driver: @driver)
    p.go(@config['self_url'] + '/' + team)
    wait_for_selector("team-menu__edit-team-button", :class)
    expect(@driver.page_source.include?('Rome')).to be(false)
    expect(@driver.page_source.include?('www.meedan.com')).to be(false)
    expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(false)
    expect(@driver.page_source.include?(" - EDIT")).to be(false)

    el = wait_for_selector('.team-menu__edit-team-button')
    el.click

    el = wait_for_selector("team__name-container", :id)
    el.click
    el.send_keys " - EDIT"

    el = wait_for_selector("team__description-container", :id)
    el.click
    el.send_keys "EDIT DESCRIPTION"

    el = wait_for_selector("team__location-container", :id)
    el.click
    el.send_keys "Rome"

    el = wait_for_selector("team__phone-container", :id)
    el.click
    el.send_keys "555199889988"

    el = wait_for_selector("team__link-container", :id)
    el.click
    el.send_keys "www.meedan.com"

    #Logo
    el = wait_for_selector(".team__edit-avatar-button")
    el.click

    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))

    el = wait_for_selector("source__edit-save-button", :class)
    el.click
    wait_for_selector("team__primary-info", :class)
    expect(@driver.page_source.include?('Rome')).to be(true)
    expect(@driver.page_source.include?('www.meedan.com')).to be(true)
    expect(@driver.page_source.include?('EDIT DESCRIPTION')).to be(true)
    expect(@driver.page_source.include?(" - EDIT")).to be(true)
  end

  it "should install and uninstall bot", bin6: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    bot_name= 'Testing Bot'
    install_bot(team, bot_name)
    wait_for_selector(".team-members__member")
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector(".team-settings__embed-tab")
    wait_for_selector('.team-settings__bots-tab').click
    wait_for_selector_none(".create-task__add-button")
    expect(@driver.page_source.include?(bot_name)).to be(true)
    wait_for_selector('.settingsIcon')
    expect(@driver.page_source.include?('No bots installed')).to be(false)
    expect(@driver.page_source.include?('More info')).to be(true)

    # Uninstall bot
    wait_for_selector('input').click
    @driver.switch_to.alert.accept
    wait_for_selector_none('.settingsIcon')
    expect(@driver.page_source.include?('No bots installed')).to be(true)
    expect(@driver.page_source.include?('More info')).to be(false)
  end

  it "should show: manage team (link only to team owners)", bin3: true do
    user = api_register_and_login_with_email
    team = request_api 'team', { name: "team#{Time.now.to_i}", email: user.email, slug: "team#{Time.now.to_i}" }
    user2 = api_register_and_login_with_email
    page = MePage.new(config: @config, driver: @driver).load
    page.ask_join_team(subdomain: team.slug)
    @wait.until {
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    }
    api_logout
    @driver = new_driver(@webdriver_url, @browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+user.email)
    #As the group creator, go to the members page and approve the joining request.
    page = MePage.new(config: @config, driver: @driver).load
        .approve_join_team(subdomain: team.slug)
    wait_for_selector(".team-menu__team-settings-button").click
    el = wait_for_selector_list("team-menu__edit-team-button",:class)
    expect(el.length > 0).to be(true)
    api_logout

    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+user2.email)
    page = MePage.new(config: @config, driver: @driver).load
    wait_for_selector("#teams-tab").click
    el = wait_for_selector_list("team-menu__edit-team-button",:class)
    expect(el.length == 0).to be(true)
  end
#team section end

#related items section start
  it "should promote related item to main item" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Main Item')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Main Item')
    fill_field('#create-media-quote-attribution-source-input', 'Related Item')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Main Item')).to be(true)
    wait_for_selector(".media-detail > div > span > div > button").click
    wait_for_selector('div[role="menu"] > div > span[role="menuitem"]').click
    wait_for_selector_none('div[role="menu"]')
    wait_for_selector(".project-header__back-button").click
    @driver.navigate.refresh
    wait_for_selector("#create-media__add-item")
    expect(@driver.page_source.include?('Main Item')).to be(true)
    expect(@driver.page_source.include?('Claim')).to be(false)
  end

  it "should create a related claim, delete the main item and verify if the related item was deleted too" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Claim Related')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Claim Related')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__edit')
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector_none(".message")
    wait_for_selector('.project-header__back-button').click
    @driver.navigate.refresh
    wait_for_selector('.create-related-media__add-button')
    wait_for_selector_list_size(".medias__item", 0)
    expect(@driver.page_source.include?('Add a link or text')).to be(true)

  end

  it "should create a related link" , bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__link').click
    wait_for_selector("#create-media-input")
    fill_field('#create-media-input', 'https://www.instagram.com/p/BRYob0dA1SC/')
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    cards = wait_for_selector_list(".media-detail").length
    expect(cards == 2).to be(true)
  end

  it "should create a related image" , bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__image').click
    wait_for_selector("#media-url-container")
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#media-url-container")
    wait_for_selector_list_size(".media-detail", 2)
    cards = wait_for_selector_list(".media-detail").length
    expect(cards == 2).to be(true)
  end

  it "should break relationship between related items" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Claim Related')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Claim Related')).to be(true)
    wait_for_selector(".media-detail > div > span > div > button").click
    wait_for_selector('div[role="menu"] > div + div > span[role="menuitem"]').click
    wait_for_selector_none('div[role="menu"]')
    wait_for_selector_list_size(".media-detail", 1)
    list_size = wait_for_selector_list(".media-detail").length
    expect(list_size == 1).to be(true)
  end

  it "should install Smooch bot, create a claim, change the status and add a related item", bin1: true do
    team = "team#{Time.now.to_i}"
    api_create_team_and_project(team: team)
    bot_name= 'Smooch'
    install_bot(team, bot_name)
    wait_for_selector(".home--team")
    card_member =  wait_for_selector(".team-members__member")
    card_member.location_once_scrolled_into_view
    expect(@driver.page_source.include?('Smooch')).to be(true)
    wait_for_selector(".team__project").click
    wait_for_selector("#search__open-dialog-button")
    wait_for_selector("#create-media__add-item").click
    wait_for_selector("#create-media__quote").click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', "Claim")
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_selector(".annotations__list")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to(".media-status__menu-item--in-progress")
    expect(@driver.page_source.include?('In Progress')).to be(true)
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Claim Related')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    wait_for_selector(".medias__item").click
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Unstarted')).to be(false)
    expect(@driver.page_source.include?('In Progress')).to be(true)
  end
#Related items section end

#Embed section Start
  it "should generate a embed from Youtube video", bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
    wait_for_selector(".media-detail")
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a embed from Youtube video' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    el = wait_for_selector('#id_content')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should generate a embed from Facebook post", bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
    wait_for_selector(".media-detail")
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a embed from Facebook' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    el = wait_for_selector('#id_content')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should generate a embed from Twitter post", bin4: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/TheWho/status/890135323216367616')
    wait_for_selector(".media-detail")
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a embed from Twitter' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    el = wait_for_selector('#id_content')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should generate a embed from Instagram post", bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.instagram.com/p/BRYob0dA1SC/')
    wait_for_selector(".media-detail")
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a embed from Instagram' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    el = wait_for_selector('#id_content')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should generate a embed from website link copy the code and insert in a blog", bin3: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://meedan.com')
    wait_for_selector(".media-detail")
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'http://codemagic.gr/'
    el = wait_for_selector('.ace_text-input')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',".ace_text-input", :css)
    button = wait_for_selector("#update")
    button.click
    expect(@driver.page_source.include?('test-team')).to be(true)
  end

  it "should create a image, change the status to in progress and generate a embed",bin4: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector(".project__description")
    create_image('test.png')
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to(".media-status__menu-item--in-progress")
    expect(@driver.page_source.include?('In Progress')).to be(true)
    generate_a_embed_and_copy_embed_code
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a embed from image' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    wait_for_selector('#id_content').send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should create a image, generate a embed, copy url and open in a incognito window", bin4: true do
   api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector(".project__description")
    create_image('test.png')
    wait_for_selector(".medias__item")
    wait_for_selector("img").click
    wait_for_selector(".media-detail")
    url = @driver.current_url.to_s
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__edit')
    el = wait_for_selector('.media-actions__embed')
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector("#media-embed__actions")
    expect(@driver.current_url.to_s == "#{url}/embed").to be(true)
    wait_for_selector('#media-embed__actions button + button').click
    wait_for_selector("#media-embed__copy-share-url")
    url = wait_for_selector("#media-embed__share-field").value.to_s
    caps = Selenium::WebDriver::Remote::Capabilities.chrome("chromeOptions" => {"args" => [ "--incognito" ]})
    driver = Selenium::WebDriver.for(:remote, url: @webdriver_url, desired_capabilities: caps)
    driver.navigate.to url
    wait_for_selector_none("#media-embed__copy-share-url")
    wait_for_selector(".pender-container")
    expect(@driver.page_source.include?('test.png')).to be(true)
  end
#Embed section end

#Meme Generator section start
  # it "should go to meme generator change the title and description save and publish and generate a embed", bin1: true do
  #   create_team_project_and_image_and_redirect_to_media_page
  #   wait_for_selector(".media__annotations-column")
  #   generate_a_embed_and_copy_embed_code
  #   expect(@driver.page_source.include?('Meme')).to be(false)
  #   @driver.navigate.back
  #   wait_for_selector(".media__annotations-column")
  #   wait_for_selector('.media-actions__icon').click
  #   wait_for_selector('.media-actions__edit')
  #   el = wait_for_selector('.media-actions__memebuster')
  #   el.location_once_scrolled_into_view
  #   el.click
  #   expect(@driver.page_source.include?('Last saved')).to be(false)
  #   wait_for_selector(".without-file")
  #   fill_field('input[name="headline"]', 'Meme')
  #   save_button = wait_for_selector(".memebuster__viewport-column > div > div button + button")
  #   expect(save_button.attribute('tabindex')== "-1" ).to be(true) #if save_button is not enable
  #   fill_field('textarea[name="description"]', 'description')
  #   expect(save_button.attribute('tabindex')== "0" ).to be(true) #if save_button is enable
  #   save_button.click
  #   wait_for_selector(".memebuster__viewport-column > div > div >  span")
  #   expect(@driver.page_source.include?('Last saved')).to be(true)
  #   publish_button = wait_for_selector(".memebuster__viewport-column > div > div button + button + button")
  #   publish_button.click
  #   wait_for_selector(".memebuster__viewport-column > div > div > div")
  #   expect(@driver.page_source.include?('Publishing')).to be(true)
  #   wait_for_selector(".memebuster__viewport-column > div > div > div > span")
  #   wait_for_selector(".memebuster__viewport-column > div > div > div > span > time")
  #   expect(@driver.page_source.include?('Publishing')).to be(false)
  #   expect(@driver.page_source.include?('Last published')).to be(true)
  #   @driver.navigate.back
  #   wait_for_selector_none(".without-file")
  #   wait_for_selector(".media__annotations-column")
  #   generate_a_embed_and_copy_embed_code
  #   wait_for_selector(".oembed__meme")
  #   expect(@driver.page_source.include?('Meme')).to be(true)
  # end
#Meme Generator section end

#Bulk Actions section start

  it "should move media to another project", bin2: true do
    claim = 'This is going to be moved'

    # Create a couple projects under the same team
    p1 = api_create_team_and_project
    p1url = @config['self_url'] + '/' + p1[:team].slug + '/project/' + p1[:project].dbid.to_s
    p2 = api_create_project(p1[:team].dbid.to_s)
    p2url = @config['self_url'] + '/' + p2.team['slug'] + '/project/' + p2.dbid.to_s

    # Go to the first project, make sure that there is no claim, and thus store the data in local Relay store
    @driver.navigate.to p1url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Go to the second project, make sure that there is no claim, and thus store the data in local Relay store
    wait_for_selector('.project-list__link + .project-list__link').click
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Create a claim under project 2
    create_media(claim)
    # Go to the second project, make sure that the claim is there
    wait_for_selector('.project-list__link + .project-list__link').click
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)

    # Move the claim to another project
    wait_for_selector(".ag-icon-checkbox-unchecked").click
    wait_for_selector(".media-bulk-actions__move-icon").click
    wait_for_selector('.Select-input input').send_keys('Project')
    wait_for_selector('.Select-option').click
    button_move = wait_for_selector('.media-bulk-actions__move-button')
    button_move.location_once_scrolled_into_view
    button_move.click
    wait_for_selector_none(".Select-placeholder")
    wait_for_selector('.project-list__link').click
    expect(@driver.current_url.to_s == p1url).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)

    # Go back to the second project and make sure that the claim is not there anymore
    wait_for_selector('.project-list__link + .project-list__link').click
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Reload the first project page and make sure that the claim is there
    @driver.navigate.to p1url
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)

    # Reload the second project page and make sure that the claim is not there
    @driver.navigate.to p2url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)
  end
#Bulk Actions section end

end
