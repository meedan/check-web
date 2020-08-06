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

  it "should login using Twitter and edit user profile", bin5: true, quick: true do
    login_with_twitter
    @driver.navigate.to @config['self_url'] + '/check/me'
    wait_for_selector("#assignments-tab")
    displayed_name = wait_for_selector('h1.source__name').text.upcase
    expected_name = @config['twitter_name'].upcase
    expect(displayed_name == expected_name).to be(true)
    expect(@driver.page_source.include?(' - edited')).to be(false)
    expect(@driver.page_source.include?('bio')).to be(false)
    wait_for_selector(".source__edit-source-button").click
    wait_for_selector("#source__name-container").send_keys("- edited")
    wait_for_selector("#source__bio-container").send_keys("Bio")
    wait_for_selector(".source__edit-save-button").click
    wait_for_selector_none("#source__bio-container")
    wait_for_selector("#assignments-tab")
    expect(@driver.page_source.include?('- edited')).to be(true)
    expect(@driver.page_source.include?("Bio")).to be(true)
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

  it "should invite a user by e-mail to join team", bin6: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to @config['self_url']+'/'+team
    wait_for_selector(".team-members__invite-button").click
    wait_for_selector(".invite-member-email-input input").send_keys("user-email@email.com")
    wait_for_selector(".team-invite-members__dialog-submit-button").click
    wait_for_selector_none(".invite-member-email-input")
  end

  it "should redirect to login screen by the join team link", bin2: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    api_logout
    @driver.quit
    @driver = new_driver(@webdriver_url,@browser_capabilities)
    @driver.navigate.to @config['self_url'] + "/"+team+"/join"
    wait_for_selector(".message")
    expect(@driver.page_source.include?("First you need to register. Once registered, you can request to join the workspace.")).to be(true)
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
  it "should create new medias using links from Facebook, Twitter, Youtube, Instagram and Tiktok", bin2: true do
    #from facebook
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
    wait_for_selector(".media-detail")
    wait_for_selector("iframe")
    expect(@driver.page_source.include?('First Draft')).to be(true)
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-form")

    #from Twitter
    expect(@driver.page_source.include?('Happy birthday Mick')).to be(false)
    create_media("https://twitter.com/TheWho/status/890135323216367616")
    wait_for_selector_list_size('.media__heading',2)
    wait_for_selector("//h4[contains(text(), 'Happy')]", :xpath)
    expect(@driver.page_source.include?('Happy birthday Mick')).to be(true)

    # from Youtube
    expect(@driver.page_source.include?("How To Check An")).to be(false)
    create_media("https://www.youtube.com/watch?v=ykLgjhBnik0")
    wait_for_selector_list_size('.media__heading',3)
    wait_for_selector("//h4[contains(text(), 'How')]", :xpath)
    expect(@driver.page_source.include?("How To Check An")).to be(true)

    #from Instagram
    expect(@driver.page_source.include?('#wEDnesday')).to be(false)
    create_media("https://www.instagram.com/p/BRYob0dA1SC/")
    wait_for_selector_list_size('.media__heading',3)
    wait_for_selector("//h4[contains(text(), 'We get')]", :xpath)
    expect(@driver.page_source.include?('#wEDnesday')).to be(true)

    #from Tiktok
    expect(@driver.page_source.include?('Who agrees with this')).to be(false)
    create_media("https://www.tiktok.com/@scout2015/video/6771039287917038854")
    wait_for_selector_list_size('.media__heading',4)
    wait_for_selector("//h4[contains(text(), 'Who agrees')]", :xpath)
    expect(@driver.page_source.include?('Who agrees with this')).to be(true)
  end

  it "should register, create a claim and assign it", bin4: true do
    page = LoginPage.new(config: @config, driver: @driver).load
    page = page.register_and_login_with_email(email: "sysops+#{Time.now.to_i}#{rand(1000)}@meedan.com", password: @password)
    page
      .create_team
      .create_project
      .create_media(input: 'Claim')
    expect(@driver.page_source.include?('Assigments updated successfully!')).to be(false)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector(".media-actions__assign").click
    wait_for_selector(".Select-input input").send_keys("user")
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    wait_for_selector_none("//span[contains(text(), 'Done')]", :xpath)
    wait_for_selector(".message")
    expect(@driver.page_source.include?('Assignments updated successfully!')).to be(true)
    wait_for_selector(".media-tab__activity").click
    wait_for_selector(".annotation__timestamp")
    expect(@driver.page_source.include?('Item assigned to')).to be(true)
  end

  it "should lock and unlock status", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'http://ca.ios.ba/files/meedan/random.php'
    wait_for_selector(".media")
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector(".media-tab__activity").click
    wait_for_selector('.annotation--verification_status')
    expect(@driver.page_source.include?('Item status locked by')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_size_change(1, '.annotation--verification_status')
    expect(@driver.page_source.include?('Item status unlocked by')).to be(true)
  end

  it "should add image to media comment", bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    # First, verify that there isn't any comment with image
    expect(@driver.page_source.include?('This is my comment with image')).to be(false)
    wait_for_selector(".media-tab__comments").click
    old = @driver.find_elements(:class, "annotations__list-item").length
    wait_for_selector(".media-tab__comments").click
    # Add a comment as a command
    fill_field('#cmd-input', 'This is my comment with image')
    wait_for_selector('.add-annotation__insert-photo').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector('.add-annotation__buttons button').click
    wait_for_selector_none(".with-file")
    wait_for_selector(".media-tab__activity").click
    wait_for_size_change(old, "annotations__list-item", :class)

    # Verify that comment was added to annotations list
    wait_for_selector(".media-tab__comments").click
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)

    # Zoom image
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)
    wait_for_selector('.annotation__card-thumbnail').click

    wait_for_selector('.ril-close')
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(false)
    @driver.action.send_keys(:escape).perform
    @wait.until {@driver.find_elements(:css, '.ril-close').length == 0 }
    expect(@driver.find_elements(:css, '.ril-image-current').empty?).to be(true)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector(".media__annotations-column")
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".annotation--card")
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgsrc = @driver.find_element(:css, '.annotation__card-thumbnail').attribute('src')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)
  end

  it "should go back to the right url from the item page", bin3: true do
    #item created in a project
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".card")
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#create-media__add-item")
    expect(@driver.current_url.to_s.match(/\/project\/[0-9]+$/).nil?).to be(false) #project page
    # send this item to trash go to the item page and go back to trash page
    wait_for_selector("input[type=checkbox]").click
    wait_for_selector(".media-bulk-actions__delete-icon").click
    wait_for_selector(".message")
    wait_for_selector('a[href$="/all-items"]').click
    wait_for_selector_none(".medias__item")
    wait_for_selector(".project-list__item-trash").click #Go to the trash page
    wait_for_selector("//span[contains(text(), 'Trash')]", :xpath)
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_selector(".media-actions__icon")
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#media-bulk-actions")
    expect(@driver.current_url.to_s.match(/trash/).nil?).to be(false) # trash page
    #item created from "all items" page
    wait_for_selector('a[href$="/all-items"]').click
    create_media("claim 2")
    wait_for_selector(".media__heading").click
    wait_for_selector("#media-detail__report-designer")
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#create-media__add-item")
    expect(@driver.current_url.to_s.match(/all-items/).nil?).to be(false) # all items page
  end

#media items section end

#tasks section start
  it "should manage, search by keywords and filter team tasks", bin6: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    api_create_team(team: team)
    p = Page.new(config: @config, driver: @driver)
    p.go(@config['self_url'] + '/' + team)
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector(".team__privacy")
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
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none("#confirm-dialog__cancel-action-button")
    expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)

    #add new task
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('.create-task__add-geolocation').click
    fill_field('#task-label-input', 'geolocation task')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector('.team-tasks-project')
    expect(@driver.page_source.include?('geolocation task')).to be(true)

    #search task by keyword
    wait_for_selector(".filter-popup > div > button > span > svg").click
    wait_for_selector('input[name="filter-search"]').send_keys("New")
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    wait_for_selector_none('input[name="filter-search"]')
    expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)
    expect(@driver.page_source.include?('geolocation task')).to be(false)

    #filter by type
    wait_for_selector(".filter-popup > div > button > span > svg").click
    wait_for_selector('input[name="filter-search"]').send_keys(:control, 'a', :delete)
    wait_for_selector("//span[contains(text(), 'All tasks')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Location')]", :xpath).click
    wait_for_selector(".multi__selector-save").click
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    wait_for_selector_none('input[name="filter-search"]')
    expect(@driver.page_source.include?('geolocation task')).to be(true)

    # Delete task
    wait_for_selector('.team-tasks__menu-item-button').click
    wait_for_selector('.team-tasks__delete-button').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none("#confirm-dialog__cancel-action-button")
    expect(@driver.page_source.include?('No default tasks to display')).to be(true)
    expect(@driver.page_source.include?('geolocation task')).to be(false)
  end

  it "should add, edit, answer, update answer and delete datetime task", bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    expect(@driver.page_source.include?('When?')).to be(false)
    expect(@driver.page_source.include?('Task created by')).to be(false)
    wait_for_selector('.create-task__add-button').click
    wait_for_selector(".create-task__add-short-answer")
    wait_for_selector('.create-task__add-datetime').click
    wait_for_selector('#task-label-input').send_keys("When?")
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none(".create-task__add-short-answer")
    wait_for_selector(".media-tab__activity").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 2')
    expect(@driver.page_source.include?('When?')).to be(true)
    expect(@driver.page_source.include?('Task created by')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Task completed by')).to be(false)
    wait_for_selector(".media-tab__tasks").click
    wait_for_selector('.task__card-expand').click
    fill_field('input[name="hour"]', '23')
    fill_field('input[name="minute"]', '59')
    wait_for_selector('#task__response-date').click
    wait_for_selector_list('button').last.click
    wait_for_selector('.task__save').click
    wait_for_selector(".media-tab__activity").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 3')
    expect(@driver.page_source.include?('Task completed by')).to be(true)

    # Edit task
    wait_for_selector(".media-tab__tasks").click
    wait_for_selector('.task__card-expand').click
    expect(@driver.page_source.include?('When was it?')).to be(false)
    wait_for_selector('.task-actions__icon').click
    el = wait_for_selector(".task-actions__edit")
    @driver.action.move_to(el).perform
    el.click
    wait_for_selector("//textarea[contains(text(), 'When?')]", :xpath)
    update_field('#task-label-input', 'When was it?')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector(".media-tab__activity").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 4')
    expect(@driver.page_source.include?('When was it?')).to be(true)
    # Edit task response
    wait_for_selector(".media-tab__tasks").click
    wait_for_selector('.task__card-expand').click
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(false)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit-response').click
    wait_for_selector('input[name="hour"]').send_keys(:control, 'a', :delete)
    update_field('input[name="hour"]', '12')
    wait_for_selector('input[name="minute"]').send_keys(:control, 'a', :delete)
    update_field('input[name="minute"]', '34')
    wait_for_selector('.task__save').click
    wait_for_selector(".media-tab__activity").click
    old = wait_for_size_change(old, 'annotation__default-content', :class, 25, 'datetime task 5')
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('12:34')).to be(true)

    # Delete task
    wait_for_selector(".media-tab__tasks").click
    wait_for_selector('.task__card-expand').click
    delete_task('When was it')
  end

  it "should assign, answer with a link and add a comment to a task", bin5: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.create-task__add-button')

    # Create a task
    wait_for_selector('.create-task__add-button').click
    el = wait_for_selector('.create-task__add-short-answer')
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Test')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none("#task-label-input")
    wait_for_selector(".media-tab__activity").click
    wait_for_selector_list_size(".annotations__list-item", 2)

    #assign the task
    wait_for_selector(".media-tab__tasks").click
    expect(@driver.page_source.include?("Assigned to")).to be (false)
    wait_for_selector('.task__card-expand').click
    wait_for_selector(".task-actions__icon").click
    wait_for_selector(".task-actions__assign").click
    wait_for_selector("#attribution")
    wait_for_selector(".Select-input input").send_keys("user")
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".attribution-dialog__save").click
    wait_for_selector(".task__assigned")
    expect(@driver.page_source.include?("Assigned to")).to be (true)

    # insert a image
    wait_for_selector(".task__log-icon > svg").click
    wait_for_selector(".add-annotation")
    wait_for_selector(".add-annotation__insert-photo").click
    wait_for_selector(".without-file")
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector('button[type=submit]').click

    #Answer with link
    wait_for_selector(".task__log-icon > svg").click
    wait_for_selector("#task__response-input")
    wait_for_selector("textarea[name=response]").send_keys("https://www.youtube.com/watch?v=ykLgjhBnik0")
    @driver.action.send_keys(:enter).perform
    expect(@driver.find_elements(:css, ".task__response").size).to eq 1

    # Add comment to task
    expect(@driver.page_source.include?('This is a comment under a task')).to be(false)
    wait_for_selector('.task__log-top span').click
    wait_for_selector("#cmd-input")
    fill_field('#cmd-input', 'This is a comment under a task')
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".media-tab__activity").click
    wait_for_selector(".annotation__author-name")
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

  it "should assign and delete list", bin3: true do
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

    wait_for_selector('.team-menu__edit-team-button').click

    el = wait_for_selector("#team__name-container")
    el.click
    el.send_keys " - EDIT"

    el = wait_for_selector("#team__description-container")
    el.click
    el.send_keys "EDIT DESCRIPTION"

    el = wait_for_selector("#team__location-container")
    el.click
    el.send_keys "Rome"

    el = wait_for_selector("#team__phone-container")
    el.click
    el.send_keys "555199889988"

    el = wait_for_selector("#team__link-container")
    el.click
    el.send_keys "www.meedan.com"

    #Logo
    wait_for_selector(".team__edit-avatar-button").click

    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))

    wait_for_selector(".source__edit-save-button").click
    wait_for_selector(".team__primary-info")
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
    wait_for_selector('.team-settings__bots-tab').click
    wait_for_selector_none(".create-task__add-button")
    expect(@driver.page_source.include?(bot_name)).to be(true)
    wait_for_selector('.settingsIcon')
    expect(@driver.page_source.include?('No bots installed')).to be(false)
    expect(@driver.page_source.include?('More info')).to be(true)

    # Uninstall bot
    wait_for_selector('.team-bots__uninstall-button').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__checkbox')
    wait_for_selector_none('.settingsIcon')
    expect(@driver.page_source.include?('No bots installed')).to be(true)
    expect(@driver.page_source.include?('More info')).to be(false)
  end

  it "should install Smooch bot and customize message", bin1: true do
    response = api_create_team_and_project
    install_bot(response[:team].slug, 'Smooch')
    wait_for_selector(".team-members__member")
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__bots-tab').click
    wait_for_selector("img[alt=Smooch]")
    wait_for_selector('.settingsIcon').click
    wait_for_selector('textarea[name="smooch_message_smooch_bot_greetings"]').send_keys(:control, 'a', :delete)
    wait_for_selector('textarea[name="smooch_message_smooch_bot_greetings"]').send_keys("Hi, this is a test")
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector("input[type=checkbox]").click
    wait_for_selector("#confirm-dialog__confirm-action-button").click
    wait_for_selector_none("#confirm-dialog__confirm-action-button")
    @driver.navigate.refresh
    wait_for_selector(".team")
    wait_for_selector('.team-settings__bots-tab').click
    wait_for_selector("img[alt=Smooch]")
    wait_for_selector('.settingsIcon').click
    wait_for_selector('textarea[name="smooch_message_smooch_bot_greetings"]')
    expect(@driver.page_source.include?('Hi, this is a test')).to be(true)
  end

  it "should add introduction and a disclaimer to team report settings", bin5: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to @config['self_url']+'/'+team
    wait_for_selector('.team')
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__report-tab').click
    wait_for_selector('#use_introduction').click
    expect(@driver.page_source.include?('Report settings updated successfully!')).to be(false)
    expect(@driver.page_source.include?('The content you set here can be edited in each individual report')).to be(true)
    wait_for_selector('#introduction').send_keys("introduction text")
    wait_for_selector('#use_disclaimer').click
    wait_for_selector('#disclaimer').send_keys("a text")
    wait_for_selector('.team p button').click #save button
    wait_for_selector(".message")
    expect(@driver.page_source.include?('Report settings updated successfully!')).to be(true)
  end

  it "should enable the slack notifications", bin5: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to @config['self_url']+'/'+team
    wait_for_selector('.team')
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__integrations-tab').click
    expect(@driver.find_elements(:css, '.Mui-checked').length == 0 )
    wait_for_selector("input[type=checkbox]").click
    @driver.navigate.refresh
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector(".Mui-checked")
    expect(@driver.find_elements(:css, '.Mui-checked').length == 1 )
    wait_for_selector(".MuiCardHeader-action").click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    wait_for_selector('input[name="webhook"]').send_keys("https://hooks.slack.com/services/00000/0000000000")
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector_none("//span[contains(text(), 'Cancel')]", :xpath)
    wait_for_selector(".MuiCardHeader-action").click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    expect(@driver.page_source.include?('hooks.slack.com/services')).to be(true)
  end

  it "should create a list and assign it on team page", bin5: true do
    team = "team#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to @config['self_url']+'/'+team
    wait_for_selector('.team')
    wait_for_selector('.create-project-card input[name="title"]').send_keys("list")
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector(".create-project-card")
    wait_for_selector(".team__project-expand").click
    wait_for_selector(".project__assignment-button").click
    wait_for_selector("input[type=checkbox]").click
    wait_for_selector(".multi__selector-save").click
    wait_for_selector(".message")
    wait_for_selector("#user__avatars")
    expect(@driver.page_source.include?('Assigned to')).to be(true)
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
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Main Item')).to be(true)
    wait_for_selector(".media-condensed__actions_icon").click
    wait_for_selector('.media-condensed__promote-relationshp').click
    wait_for_selector_none(".media-condensed__break-relationshp")
    wait_for_selector(".project-header__back-button").click
    @driver.navigate.refresh
    wait_for_selector("#create-media__add-item")
    expect(@driver.page_source.include?('Main Item')).to be(true)
    expect(@driver.page_source.include?('Claim')).to be(false)
  end

  it "should create a related image, delete the main item and verify that the both items were deleted" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    #add a related image
    wait_for_selector('.create-related-media__add-button').click
    wait_for_selector('#create-media__image').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector('#create-media-dialog__submit-button').click
    #verify that the image was created
    wait_for_selector(".media-related__secondary-item")
    cards = wait_for_selector_list(".card").length
    expect(cards == 2).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__edit')
    #delet the main item
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector_none(".message")
    wait_for_selector('.project-header__back-button').click
    @driver.navigate.refresh
    wait_for_selector('#create-media__add-item')
    #verify that both items were deleted
    wait_for_selector_list_size(".medias__item", 0)
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
  end

  it "should break relationship between related items" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    #add a related link
    wait_for_selector('#create-media__link').click
    wait_for_selector("#create-media-input")
    fill_field('#create-media-input', 'https://twitter.com/meedan/status/1167366036791943168')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    #verify that the link was created
    wait_for_selector_list_size(".media-detail", 2)
    cards = wait_for_selector_list(".media-detail").length
    expect(cards == 2).to be(true)
    #break the relationship between the items
    wait_for_selector(".media-condensed__actions_icon").click
    wait_for_selector('.media-condensed__break-relationship').click
    wait_for_selector_none('.media-condensed__break-relationship')
    wait_for_selector_list_size(".media-detail", 1)
    list_size = wait_for_selector_list(".media-detail").length
    expect(list_size == 1).to be(true)
  end

  it "should install Smooch bot, create a claim, change the status and add a related item", bin1: true do
    response = api_create_team_and_project
    bot_name = 'Smooch'
    install_bot(response[:team].slug, bot_name)
    wait_for_selector(".home--team")
    card_member = wait_for_selector(".team-members__member")
    card_member.location_once_scrolled_into_view
    expect(@driver.page_source.include?('Smooch')).to be(true)
    wait_for_selector(".team__project").click
    wait_for_selector("#search__open-dialog-button")
    create_media("Claim")
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading a").click
    wait_for_selector(".create-related-media__add-button")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to(".media-status__menu-item--in-progress", true)
    wait_for_selector(".media-status__current--in-progress")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Claim Related')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    wait_for_selector(".medias__item").click
    wait_for_selector(".media-status__current--in-progress")
  end
#Related items section end

#Report section Start
  {
    'YouTube' => 'https://www.youtube.com/watch?v=ykLgjhBnik0',
    'Facebook' => 'https://www.facebook.com/FirstDraftNews/posts/1808121032783161',
    'Twitter' => 'https://twitter.com/TheWho/status/890135323216367616',
    'Instagram' => 'https://www.instagram.com/p/BRYob0dA1SC/',
  }.each do |provider, url|
    it "should generate a report from #{provider} video", bin1: true do
      api_create_team_project_and_link_and_redirect_to_media_page(url)
      wait_for_selector('.media-detail')
      generate_a_report_and_copy_report_code
      @driver.navigate.to 'https://paste.ubuntu.com/'
      title = 'A report at ' + Time.now.to_i.to_s
      fill_field('#id_poster' , title)
      wait_for_selector('#id_content').send_keys(' ')
      @driver.action.send_keys(:control, 'v').perform
      wait_for_text_change(' ',"#id_content", :css)
      expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
    end
  end

  it "should generate a report from website link copy the code and insert in a blog", bin3: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://meedan.com')
    wait_for_selector(".media-detail")
    generate_a_report_and_copy_report_code
    @driver.navigate.to 'http://codemagic.gr/'
    wait_for_selector('.ace_text-input').send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',".ace_text-input", :css)
    button = wait_for_selector("#update")
    button.click
    expect(@driver.page_source.include?('test-team')).to be(true)
  end

  it "should create a image, change the status to in progress and generate a report",bin4: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector(".project__description")
    create_image('test.png')
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading img")
    wait_for_selector(".media__heading a").click
    wait_for_selector(".card")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to(".media-status__menu-item--in-progress", false)
    expect(@driver.page_source.include?('In Progress')).to be(true)
    generate_a_report_and_copy_report_code
    expect(@driver.page_source.include?('In Progress')).to be(true)
    @driver.navigate.to 'https://paste.ubuntu.com/'
    title = 'a report from image' + Time.now.to_i.to_s
    fill_field('#id_poster' , title)
    wait_for_selector('#id_content').send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should generate a report, copy the share url and open the report page in a incognito window", bin4: true do
   api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('.project__description')
    create_image('test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('img').click
    wait_for_selector('#media-detail__report-designer').click
    wait_for_selector('.report-designer__actions-copy')
    wait_for_selector("//span[contains(text(), 'Edit')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Report image')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Report text')]", :xpath).click
    wait_for_selector("#report-designer__text").send_keys("text message")
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Edit')]", :xpath)
    wait_for_selector('.report-designer__copy-share-url').click
    embed_url = wait_for_selector('.report-designer__copy-share-url input').property('value').to_s
    caps = Selenium::WebDriver::Remote::Capabilities.chrome('chromeOptions' => { 'args' => [ '--incognito' ]})
    driver = Selenium::WebDriver.for(:remote, url: @webdriver_url, desired_capabilities: caps)
    begin
      driver.navigate.to embed_url
      @wait.until { driver.find_element(:id, "container") }
      expect(driver.page_source.include?('text message')).to be(true)
    ensure
      driver.quit
    end
  end
#Report section end

#Bulk Actions section start
  it "should move media to another project", bin2: true do
    claim = 'This is going to be moved'

    # Create a couple projects under the same team
    p1 = api_create_team_and_project
    p1url = @config['self_url'] + '/' + p1[:team].slug + '/project/' + p1[:project].dbid.to_s
    p2 = api_create_project(p1[:team].dbid.to_s)
    p2url = @config['self_url'] + '/' + p2.team['slug'] + '/project/' + p2.dbid.to_s

    # Go to the first project make sure that there is no claim
    @driver.navigate.to p1url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Go to the second project make sure that there is no claim
    @driver.navigate.to p2url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Create a claim under project 2
    create_media(claim)
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)
    wait_for_selector('.media__heading a')  # wait for backend to process claim

    # Move the claim to another project
    wait_for_selector("tbody input[type='checkbox']:not(:checked)").click
    wait_for_selector("#media-bulk-actions__move-to").click
    wait_for_selector("input[name=project-title]").send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-bulk-actions__move-button').click
    wait_for_selector_none("input[name=project-title]")  # wait for dialog to disappear
    @driver.navigate.to p1url
    expect(@driver.current_url.to_s == p1url).to be(true)
    wait_for_selector_list_size(".medias__item",1)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)

    # Go back to the second project and make sure that the claim is not there anymore
    @driver.navigate.to p2url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?("Add a link or text")).to be(true)

    # Reload the first project page and make sure that the claim is there
    @driver.navigate.to p1url
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?("Add a link or text")).to be(false)
  end

  it "should move media to another project from item page", bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector("#search-input")
    wait_for_selector(".drawer__create-project-button").click
    wait_for_selector('.create-project-form input[name="title"]').send_keys("project 2")
    @driver.action.send_keys(:enter).perform
    wait_for_selector_none(".media__heading", :css, 5)
    wait_for_selector(".project-list__link", index: 0).click
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
    wait_for_selector(".project-list__link", index: 1).click
    wait_for_selector("#media-bulk-actions__actions")
    wait_for_selector(".media__heading").click
    wait_for_selector("#media-actions-bar__move-to").click
    wait_for_selector("input[name=project-title]").send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-actions-bar__move-button').click
    wait_for_selector_none("input[name=project-title]")  # wait for dialog to disappear
    wait_for_selector("#search-input")
    wait_for_selector(".media__heading")
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector(".project-list__link", index: 1).click
    wait_for_selector_none(".media__heading", :css, 5)
    expect(@driver.page_source.include?('My search result')).to be(false)
  end

  it "should add media to another project from item page", bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector("#search-input")
    wait_for_selector(".drawer__create-project-button").click
    wait_for_selector('.create-project-form input[name="title"]').send_keys("project 2")
    @driver.action.send_keys(:enter).perform
    wait_for_selector_none(".media__heading")
    wait_for_selector(".project-list__link", index: 0).click
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
    wait_for_selector(".project-list__link", index: 1).click
    wait_for_selector(".media__heading").click
    wait_for_selector("#media-actions-bar__add-to").click
    wait_for_selector("input[name=project-title]").send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-actions-bar__add-button').click
    wait_for_selector_none("input[name=project-title]")  # wait for dialog to disappear
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector(".project-list__link", index: 0).click
    wait_for_selector(".media__heading")
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should create items, add to another project and then delete it", bin6: true do
    project1 = api_create_team_and_project
    api_create_project(project1[:team].dbid.to_s)
    @driver.navigate.to @config['self_url']
    wait_for_selector("#create-media__add-item")
    create_media("claim 1")
    wait_for_selector_none("#create-media__field")
    wait_for_selector(".medias__item")
    create_media("claim 2")
    wait_for_selector_list_size(".medias__item", 2)
    expect(@driver.page_source.include?('Add a link or text')).to be(false)
    # 0th <a> is "All items"; 1st is project 1; 2nd is project 2
    wait_for_selector('.projects__list a', index: 2).click  # project 2
    wait_for_selector_none(".medias__item")
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
    wait_for_selector('.projects__list a', index: 1).click  # project 1
    wait_for_selector_list_size(".medias__item", 2)
    wait_for_selector("thead input[type='checkbox']:not(:checked)").click
    wait_for_selector("#media-bulk-actions__add-icon").click
    wait_for_selector("input[name=project-title]").send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-bulk-actions__add-button').click
    wait_for_selector_none("input[name=project-title]")  # wait for dialog to disappear
    wait_for_selector('.projects__list a', index: 2).click  # project 2
    wait_for_selector_list_size(".medias__item", 2, :css)
    expect(@driver.page_source.include?('claim 1')).to be(true)
    expect(@driver.page_source.include?('claim 2')).to be(true)
    wait_for_selector("thead input[type='checkbox']:not(:checked)").click
    wait_for_selector(".media-bulk-actions__delete-icon").click # Delete items
    wait_for_selector_none(".medias__item")
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
    wait_for_selector(".project-list__item-trash").click #Go to the trash page
    wait_for_selector_list_size(".medias__item", 2, :css)
    expect(@driver.page_source.include?('claim 1')).to be(true)
    expect(@driver.page_source.include?('claim 2')).to be(true)
  end

  it "should restore items from the trash", bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media")
    expect(@driver.page_source.include?("Claim")).to be(true)
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    wait_for_selector(".project-list__item-trash").click #Go to the trash page
    wait_for_selector(".media__heading")
    wait_for_selector("body input[type='checkbox']:not(:checked)").click
    wait_for_selector("#media-bulk-actions__actions").click
    wait_for_selector(".message")
    wait_for_selector(".projects__list a[href$='/all-items']").click
    wait_for_selector_list_size(".medias__item", 1, :css)
    expect(@driver.page_source.include?("Claim")).to be(true)
  end

  it "should restore item from trash from item page", bin2: true do
    #create media from list and send it to trash
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media")
    expect(@driver.page_source.include?("Claim")).to be(true)
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    #create media from all items and send it to trash
    wait_for_selector(".project-list__link-all").click
    create_media("media from all items")
    wait_for_selector(".media__heading").click
    wait_for_selector(".create-related-media__add-button")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector_none(".create-related-media__add-button")
    wait_for_selector(".message",:css,30).click #message
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    #Go to the trash page and restore the item
    wait_for_selector(".project-list__item-trash").click
    wait_for_selector_list_size(".media__heading",2)
    wait_for_selector(".media__heading").click
    wait_for_selector(".media-status")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector("#media-actions__restore").click
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    wait_for_selector(".project-list__link-all").click
    wait_for_selector(".media__heading" )
    expect(@driver.page_source.include?("media from all items")).to be(true)
    # Go to the trash page and restore the another item
    wait_for_selector(".project-list__item-trash").click
    wait_for_selector(".media__heading").click
    wait_for_selector(".media-status")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector("#media-actions__restore").click
    wait_for_selector(".create-related-media__add-button")
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    wait_for_selector(".project-list__link").click
    wait_for_selector(".media__heading")
    expect(@driver.page_source.include?("Claim")).to be(true)
  end

  it "should remove item from list", bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media")
    wait_for_selector(".project-header__back-button").click
    expect(@driver.page_source.include?("Add a link or text")).to be(false)
    wait_for_selector_list_size(".medias__item",1)
    wait_for_selector("body input[type='checkbox']:not(:checked)").click
    wait_for_selector("#media-bulk-actions__remove-from-list").click #remove_button
    wait_for_selector_none(".media")
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    expect(@driver.page_source.include?("Add a link or text")).to be(true)
  end
#Bulk Actions section end

#Permissions section start
  it "should manage team members", bin5: true, quick: true do
    # setup
    @user_mail = "test" +Time.now.to_i.to_s+rand(9999).to_s + @user_mail
    @team1_slug = 'team1'+Time.now.to_i.to_s+rand(9999).to_s
    user = api_register_and_login_with_email(email: @user_mail, password: @password)
    team = request_api 'team', { name: 'Team 1', email: user.email, slug: @team1_slug }
    request_api 'project', { title: 'Team 1 Project', team_id: team.dbid }
    team = request_api 'team', { name: 'Team 2', email: user.email, slug: "team-2-#{rand(9999)}#{Time.now.to_i}" }
    request_api 'project', { title: 'Team 2 Project', team_id: team.dbid }

    page = MePage.new(config: @config, driver: @driver).load
    wait_for_selector(".source__primary-info")
    page.select_team(name: 'Team 1')

    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team 1')
    expect(wait_for_selector(".team__project-title").text.include?('Team 1 Project')).to be(true)
    expect(wait_for_selector(".team__project-title").text.include?('Team 2 Project')).to be(false)

    @driver.navigate.to(@config['self_url'] + '/check/me')
    wait_for_selector(".source__primary-info")
    page.select_team(name: 'Team 2')

    wait_for_selector(".team__primary-info")
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team 2')
    expect(wait_for_selector(".team__project-title").text.include?('Team 1 Project')).to be(false)
    expect(wait_for_selector(".team__project-title").text.include?('Team 2 Project')).to be(true)

    #As a different user, request to join one team and be accepted.
    user = api_register_and_login_with_email(email: "new"+@user_mail, password: @password)
    page = MePage.new(config: @config, driver: @driver).load
    page.ask_join_team(subdomain: @team1_slug)
    @wait.until {
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    }
    api_logout
    @driver.quit

    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+@user_mail)

    #As the group creator, go to the members page and approve the joining request.
    page = MePage.new(config: @config, driver: @driver).load
    page.go(@config['self_url'] + '/check/me')
    page.approve_join_team(subdomain: @team1_slug)
    count = 0
    elems = @driver.find_elements(:css => ".team-members__member")
    while elems.size <= 1 && count < 15
      sleep 5
      count += 1
      elems = @driver.find_elements(:css => ".team-members__member")
    end
    expect(elems.size).to be > 1

    #edit team member role
    change_the_member_role_to('li.role-journalist')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'journalist'

    # "should redirect to team page if user asking to join a team is already a member"
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email=new'+@user_mail)
    #page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + "/"+@team1_slug+"/join"

    wait_for_selector('.team__primary-info')
    @wait.until {
      expect(@driver.current_url.eql? @config['self_url']+"/"+@team1_slug ).to be(true)
    }

    # "should reject member to join team"
    user = api_register_and_login_with_email
    page = MePage.new(config: @config, driver: @driver).load
    page.ask_join_team(subdomain: @team1_slug)
    @wait.until {
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    }
    api_logout
    @driver.quit

    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+@user_mail)
    page = MePage.new(config: @config, driver: @driver).load
        .disapprove_join_team(subdomain: @team1_slug)
    count = 0
    while @driver.page_source.include?('Requests to join') && count < 15
      sleep 5
      count += 1
    end
    expect(@driver.page_source.include?('Requests to join')).to be(false)

    # "should delete member from team"
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+@user_mail)
    page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + '/'+@team1_slug
    wait_for_selector('.team-members__member')
    wait_for_selector('.team-members__edit-button').click

    l = wait_for_selector_list_size('team-members__delete-member', 2, :class)
    old = l.length
    expect(l.length > 1).to be(true)
    l.last.click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__checkbox')
    new = wait_for_size_change(old, 'team-members__delete-member', :class)
    expect(new < old).to be(true)
  end

  it "should check user permissions", bin6: true do
    # setup
    @user_mail = "test" +Time.now.to_i.to_s+rand(9999).to_s + @user_mail
    @team1_slug = 'team1'+Time.now.to_i.to_s+rand(9999).to_s
    user = api_register_and_login_with_email(email: @user_mail, password: @password)
    team = request_api 'team', { name: 'Team', email: user.email, slug: @team1_slug }
    request_api 'project', { title: 'Team Project', team_id: team.dbid }
    @driver.navigate.to @config['self_url'] + "/" + @team1_slug
    wait_for_selector(".team__primary-info")
    team_name = wait_for_selector('.team__name').text
    expect(team_name).to eq('Team')
    expect(wait_for_selector(".team__project-title").text.include?('Team Project')).to be(true)
    api_logout
    #As a different user, request to join one team and be accepted.
    user2 = api_register_and_login_with_email(email: "new"+@user_mail, password: @password)
    page = MePage.new(config: @config, driver: @driver).load
    page.ask_join_team(subdomain: @team1_slug)
    @wait.until {
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    }
    api_logout
    @driver.quit
    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+@user_mail)
    #As the group creator, go to the members page and approve the joining request.
    page = MePage.new(config: @config, driver: @driver).load
    page.go(@config['self_url'] + '/check/me')
    page.approve_join_team(subdomain: @team1_slug)
    count = 0
    elems = @driver.find_elements(:css => ".team-members__member")
    while elems.size <= 1 && count < 15
      sleep 5
      count += 1
      elems = @driver.find_elements(:css => ".team-members__member")
    end
    expect(elems.size).to be > 1
    #edit team member role
    change_the_member_role_to('li.role-journalist')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'journalist'

    #create one media
    wait_for_selector(".project-list__link", index: 0).click
    create_media("one item")
    wait_for_selector_list_size(".medias__item", 1)
    expect(@driver.page_source.include?('one item')).to be(true)

    # "should redirect to team page if user asking to join a team is already a member"
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email=new'+@user_mail)
    #page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + "/"+@team1_slug+"/join"
    wait_for_selector('.team__primary-info')
    @wait.until {
      expect(@driver.current_url.eql? @config['self_url']+"/"+@team1_slug ).to be(true)
    }
    #As a different user, request to join one team
    user3 = api_register_and_login_with_email(email: "one_more"+@user_mail, password: @password)
    page = MePage.new(config: @config, driver: @driver).load
    page.ask_join_team(subdomain: @team1_slug)
    @wait.until {
      expect(@driver.find_element(:class, "message").nil?).to be(false)
    }
    api_logout
    @driver.quit
    #As the journalist, go to the members page and can't see the request to join the another user
    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email=new'+@user_mail)
    page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + "/"+@team1_slug
    wait_for_selector(".create-project-card")
    expect(@driver.page_source.include?('Requests to join')).to be(false)

    #go to the project that you don't own and can't see the actions icon
    wait_for_selector(".project-list__link", index: 0).click
    wait_for_selector_none(".project-actions__icon") #actions icon
    expect(@driver.find_elements(:css, ".project-actions__icon").size).to eq 0

    #create media in a project that you don't own
    expect(@driver.page_source.include?('new item')).to be(false)
    create_media("new item")
    wait_for_selector_list_size(".medias__item", 2)
    expect(@driver.page_source.include?('new item')).to be(true)

    #see the icon 'change the status' that the media you don't own
    wait_for_selector_list(".media__heading a")[1].click
    wait_for_selector(".create-related-media__add-button")
    expect(@driver.find_elements(:css, ".media-status button").size).to eq 1

    # see the input to add a comment in media you don't own
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".add-annotation__buttons")
    expect(@driver.find_elements(:css, "#cmd-input").size).to eq 1

    #try edit team and can't see the button 'edit team button'
    wait_for_selector(".project-header__back-button").click
    wait_for_selector(".team-menu__team-settings-button").click
    wait_for_selector(".team-settings__tags-tab")
    expect(@driver.find_elements(:css, ".team-menu__edit-team-button").size).to eq 0

    api_logout
    @driver.quit

    #As the group creator, go to the members page and edit team member role to 'contribuitor'
    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email='+@user_mail)
    page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + "/"+@team1_slug
    #edit team member role
    change_the_member_role_to('li.role-contributor')
    el = wait_for_selector('input[name="role-select"]', index: 1)
    expect(el.property('value')).to eq 'contributor'

    api_logout
    @driver.quit

    #log in as the contributor
    @driver = new_driver(@webdriver_url,@browser_capabilities)
    page = Page.new(config: @config, driver: @driver)
    page.go(@config['api_path'] + '/test/session?email=new'+@user_mail)
    page = MePage.new(config: @config, driver: @driver).load
    @driver.navigate.to @config['self_url'] + "/"+@team1_slug

    #can't see the link 'edit member roles'
    expect(@driver.find_elements(:css, ".team-members__edit-button").size).to eq 0

    #can't see the link 'create a new list'
    expect(@driver.find_elements(:css, ".create-project-card").size).to eq 0

    #go to the project and can't see the icon 'change the status' that the media you don't own
    wait_for_selector(".project-list__link", index: 0).click
    wait_for_selector(".media__heading a", index: 1).click
    wait_for_selector(".create-related-media__add-button")
    expect(@driver.find_elements(:css, ".media-status button[disabled]").size).to eq 1
  end
#Permissions section end

#Rules section start
  it "should set, edit and delete rules", bin3: true do
    user = api_register_and_login_with_email
    t = api_create_team(user: user)

    # Go to rules page
    @driver.navigate.to @config['self_url'] + '/' + t.slug + '/settings'
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('#tableTitle')

    # No rules
    expect(@driver.page_source.include?('0 rules')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(false)

    # Create new rule and check that form is blank
    wait_for_selector('.rules__new-rule').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(false)
    expect(@driver.page_source.include?('keyword')).to be(false)
    expect(@driver.page_source.include?('foo,bar')).to be(false)
    expect(@driver.page_source.include?('Move item to list')).to be(false)
    expect(@driver.page_source.include?('Select destination list')).to be(false)

    # Select a condition and set a value for it
    wait_for_selector('.rules__rule-field div[role="button"]').click
    wait_for_selector('ul[role=listbox] li[role=option]').click
    wait_for_selector('.rules__rule-field textarea').send_keys('foo,bar')
    wait_for_selector('body').click

    # Select an action
    wait_for_selector('.rules__actions .rules__rule-field div[role="button"]').click
    wait_for_selector('ul[role=listbox] li[role=option]').click
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    # Set rule name
    wait_for_selector('input[name="rule-name"]').click
    @driver.action.send_keys('Rule 1').perform

    # Save
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(true)

    # Open
    wait_for_selector('tbody tr').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move item to list')).to be(true)
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    # Reload the page and make sure that everything was saved correctly and is displayed correctly
    @driver.navigate.refresh
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    wait_for_selector('tbody tr').click
    wait_for_selector('input[name="rule-name"]')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move item to list')).to be(true)
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    #edit rule
    wait_for_selector('input[name="rule-name"]').click
    @driver.action.send_keys('- Edited').perform
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(true)

    #delet rule
    wait_for_selector('tbody tr').click
    wait_for_selector("//span[contains(text(), 'More')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Delete')]", :xpath).click
    wait_for_selector("#confirm-dialog__checkbox").click
    wait_for_selector("#confirm-dialog__confirm-action-button").click
    wait_for_selector(".message")
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(false)
  end
#Rules section end

#Search and Filter section start
  it "sort by date that the media was created", bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector(".medias__item")
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector(".date-range__start-date input").click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector(".date-range__end-date input").click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector(".medias__item")
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should filter by status and search by keywords", bin2: true, quick:true do
    api_create_claim_and_go_to_search_page
    expect(@driver.page_source.include?('My search result')).to be(true)
    create_media("media 2")
    create_media("media 3")
    wait_for_selector_list(".media__heading a")[0].click
    change_the_status_to(".media-status__menu-item--false", false)
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    wait_for_selector_list(".media__heading a")[1].click
    wait_for_selector(".media__annotations-column")
    change_the_status_to(".media-status__menu-item--verified", false)
    wait_for_selector(".project-header__back-button").click
    wait_for_selector_list_size(".media__heading", 3)
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector("#search-query__cancel-button")
    wait_for_selector("#search-query__status-false").click
    wait_for_selector("#search-query__status-verified").click
    wait_for_selector("#search-query__submit-button").click
    expect(@driver.page_source.include?('My search result')).to be(false)
    attempts = 0
    while !@driver.page_source.include?('media 2') && attempts < 30
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-query__cancel-button")
      wait_for_selector("#search-query__status-verified").click
      wait_for_selector("#search-query__submit-button").click
      sleep 1
      attempts += 1
    end
    while !@driver.page_source.include?('media 3') && attempts < 30
      wait_for_selector("#search__open-dialog-button").click
      wait_for_selector("#search-query__cancel-button")
      wait_for_selector("#search-query__status-false").click
      wait_for_selector("#search-query__submit-button").click
      sleep 1
      attempts += 1
    end
    expect(@driver.page_source.include?('media 3')).to be(true)
    expect(@driver.page_source.include?('media 2')).to be(true)
    wait_for_selector_list_size(".media__heading", 2)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector("#search__open-dialog-button").click
    selected = @driver.find_elements(:css, '.search-query__filter-button--selected')
    expect(selected.size == 2).to be(true)
    #reset filter
    wait_for_selector("//span[contains(text(), 'Reset')]", :xpath).click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector_list_size(".media__heading", 3)

    #search by keyword
    wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    wait_for_selector("#search-input").send_keys("search")
    @driver.action.send_keys(:enter).perform
    wait_for_selector_list_size(".media__heading", 1)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should filter item by status on trash page", bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector("#search-input")
    wait_for_selector(".media__heading").click
    wait_for_selector(".media")
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    wait_for_selector(".project-list__item-trash").click #Go to the trash page
    wait_for_selector(".media__heading")
    #user filter option
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector("#search-query__cancel-button")
    wait_for_selector("#search-query__status-in_progress").click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector_none("#search-query__cancel-button")
    expect(@driver.page_source.include?('My search result')).to be(false)
    #reset filter
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector("#search-query__cancel-button")
    wait_for_selector("#search-query__status-in_progress").click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector_none("#search-query__cancel-button")
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should search and change sort criteria", bin2: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/related/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)

    wait_for_selector("th[data-field=linked_items_count] span").click
    wait_for_selector(".medias__item")
    expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/related/)).nil?).to be(false)
    expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector("th[data-field=created_at] span").click
    wait_for_selector(".medias__item")
    expect((@driver.current_url.to_s.match(/requests/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/related/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/recent_added/)).nil?).to be(false)
    expect((@driver.current_url.to_s.match(/last_seen/)).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should search and change sort order", bin2: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.current_url.to_s.match(/ASC|DESC/)).nil?).to be(true)

    wait_for_selector("th[data-field=linked_items_count]").click
    wait_for_selector(".medias__item")
    expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(false)
    expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector("th[data-field=linked_items_count]").click
    wait_for_selector(".medias__item")
    expect((@driver.current_url.to_s.match(/DESC/)).nil?).to be(true)
    expect((@driver.current_url.to_s.match(/ASC/)).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should search by project through URL", bin2: true do
    data = api_create_team_and_project
    project_id = data[:project].dbid.to_s
    claim = request_api 'claim', { quote: 'Claim', email: data[:user].email, team_id: data[:team].dbid, project_id: project_id }
    sleep 2
    MediaPage.new(config: @config, driver: @driver)
    @driver.navigate.to @config['self_url'] + '/' + data[:team].slug + '/all-items/%7B"projects"%3A%5B' + project_id + '%5D%7D'
    wait_for_selector(".search__results-heading")
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector("#search-query__cancel-button")
    selected = @driver.find_elements(:css, '.search-filter__project-chip--selected')
    expect(selected.size == 1).to be(true)
  end

  it "should search by date range", bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector(".medias__item")
    expect(@driver.page_source.include?('My search result')).to be(true)

    # Pre-populate dates to force the date picker to open at certain calendar months.
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D'
    wait_for_selector_none(".medias__item", :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)

    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector(".date-range__start-date input").click

    # The date picker is broken: https://github.com/mui-org/material-ui-pickers/issues/1526
    # The upshot: open it with value=2016-01-01, click "OK", and it will return a different
    # date. That's why we can submit the form even though it looks like this test isn't
    # changing any values.
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none("body>div[role=dialog]")  # wait for mui-picker background to fade away
    wait_for_selector(".date-range__end-date input").click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none("body>div[role=dialog]")  # wait for mui-picker background to fade away
    wait_for_selector("#search-query__submit-button:not(:disabled)").click
    wait_for_selector_none(".medias__item",:css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)
  end

  it "should change search sort and search criteria through URL", bin2: true do
    api_create_claim_and_go_to_search_page
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"related"%2C"sort_type"%3A"DESC"%7D'
    wait_for_selector("#create-media__add-item")
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, "th[data-field=linked_items_count]> span > svg").length).to eq 1
    expect(@driver.find_elements(:css, "th[data-field=created_at]> span > svg").empty?).to be(true)

    @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items/%7B"sort"%3A"recent_added"%2C"sort_type"%3A"DESC"%7D'
    wait_for_selector("#create-media__add-item")
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, "th[data-field=linked_items_count]> span > svg").empty?).to be(true)
    expect(@driver.find_elements(:css, "th[data-field=created_at]> span > svg").length).to eq 1
  end

  it "should search for reverse images", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://twitter.com/meedan/status/1167366036791943168'
    card = wait_for_selector_list(".media-detail").length
    expect(card == 1).to be(true)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
    current_window = @driver.window_handles.last
    wait_for_selector(".media-detail__reverse-image-search > button").click
    @driver.switch_to.window(@driver.window_handles.last)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
    @driver.switch_to.window(current_window)
  end

  it "should find all medias with an empty search", bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search__open-dialog-button")
    create_image('test.png')
    old = wait_for_selector_list(".medias__item").length
    wait_for_selector("#search-input").click
    @driver.action.send_keys(:enter).perform
    current = wait_for_selector_list(".medias__item").length
    expect(old == current).to be(true)
    expect(current > 0).to be(true)
  end
#Search and Filter section end

#tag section start
  it "should manage and search team tags", bin6: true do
    # Create team and go to team page that should not contain any tag
    team = "tag-team-#{Time.now.to_i}"
    api_create_team(team: team)
    p = Page.new(config: @config, driver: @driver)
    @driver.navigate.to @config['self_url'] + '/' + team
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__tasks-tab')
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector_none("team-tasks")
    expect(@driver.page_source.include?('No tags')).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(false)

    # Create tag
    fill_field('#tag__new', 'newtag')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-newtag")
    expect(@driver.page_source.include?('No tags')).to be(false)
    expect(@driver.page_source.include?('1 tag')).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(false)

    # Edit tag
    wait_for_selector('.tag__actions').click
    wait_for_selector(".tag__delete")
    wait_for_selector('.tag__edit').click
    wait_for_selector("#tag__edit")
    fill_field('#tag__edit', 'edited')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-newtagedited")
    expect(@driver.page_source.include?('1 tag')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(true)

    # Create another tag
    fill_field('#tag__new', 'tag2')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-tag2")
    expect(@driver.page_source.include?('tag2')).to be(true)

    #search tag by keyword
    wait_for_selector(".filter-popup > div > button > span > svg").click
    wait_for_selector("input[name=sort-select]")
    wait_for_selector("input[placeholder='Search…']").send_keys("edited")
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    expect(@driver.page_source.include?('newtagedited')).to be(true)
    expect(@driver.page_source.include?('tag2')).to be(false)

    # Delete tag
    wait_for_selector('.tag__actions').click
    wait_for_selector('.tag__edit')
    wait_for_selector('.tag__delete').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#tag__confirm')
    wait_for_selector_none("#tag__text-newtagedited")
    expect(@driver.page_source.include?('No tags')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(false)
  end
#tag section end

# video timeline section start
  it "should manage video notes", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.youtube.com/watch?v=em8gwDcjPzU'
    wait_for_selector(".media-detail")
    wait_for_selector("//span[contains(text(), 'Video annotation')]", :xpath).click
    wait_for_selector("div[aria-labelledby=TimelineTab]")
    expect(@driver.page_source.include?('Timeline')).to be(true)
    #add a new note
    wait_for_selector("button[data-testid=new-comment-thread-button]").click
    wait_for_selector("#comment").send_keys("my note")
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector(".MuiAvatar-img")
    wait_for_selector(".MuiIconButton-sizeSmall").click #close timeline button
    @driver.navigate.refresh
    wait_for_selector("#video-media-card__playback-rate")
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".annotation__card-content")
    expect(@driver.page_source.include?('my note')).to be(true) # check the video note appears on the note tab
    wait_for_selector("//span[contains(text(), 'Video annotation')]", :xpath).click
    wait_for_selector(".MuiAvatar-img").click
    #add a new note the comment
    wait_for_selector("#comment").send_keys("new note")
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector("//p[contains(text(), 'new note')]", :xpath)
    #delet note
    wait_for_selector("button[aria-label='Delete thread']").click
    wait_for_selector_none(".MuiAvatar-img")
    expect(@driver.page_source.include?('my note')).to be(false)
    wait_for_selector(".MuiIconButton-sizeSmall").click #close timeline button
    @driver.navigate.refresh
    wait_for_selector(".media-detail")
    wait_for_selector(".media-tab__comments").click
    expect(@driver.page_source.include?('my note')).to be(false) # check the video note disappears from the comments tab
  end

  it "should manage videotags", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.youtube.com/watch?v=em8gwDcjPzU'
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('my videotag')).to be(false)
    wait_for_selector("//span[contains(text(), 'Video annotation')]", :xpath).click
    wait_for_selector("div[aria-labelledby=TimelineTab]")
    expect(@driver.page_source.include?('Timeline')).to be(true)
    #add a videotag
    wait_for_selector("div[data-testid=entities-tags]")
    wait_for_selector("button[data-testid=new-tag-button]").click
    wait_for_selector("#tag-suggestions").send_keys("my videotag")
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//p[contains(text(), 'my videotag')]", :xpath)
    wait_for_selector(".MuiIconButton-sizeSmall").click #close timeline button
    wait_for_selector(".MuiChip-icon")
    wait_for_selector("#video-media-card__playback-rate")
    expect(@driver.page_source.include?('my videotag')).to be(true) # check the videotag appears on the page
    wait_for_selector(".MuiChip-icon").click
    wait_for_selector("div[aria-labelledby=TimelineTab]")
    expect(@driver.page_source.include?('Timeline')).to be(true)
    wait_for_selector(".MuiIconButton-sizeSmall").click #close timeline button
    wait_for_selector("//span[contains(text(), 'my videotag')]", :xpath).click
    wait_for_selector("#search-input")
    expect(@driver.current_url.to_s.match(/all-items/).nil?).to be(false) # check the redirect
  end
#videotimeline section end

#status section start
  it "should customize status", bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    wait_for_selector(".media-status__current").click
    wait_for_selector(".media-status__menu-item")
    ['Unstarted', 'Inconclusive','In Progress'].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(true)
    end
    expect(@driver.page_source.include?('new status')).to be(false)
    item_page = @driver.current_url
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/settings'
    wait_for_selector(".team__primary-info")
    wait_for_selector(".team-settings__statuses-tab").click
    wait_for_selector("//span[contains(text(), 'English (default)')]", :xpath)
    expect(@driver.page_source.include?('Unstarted')).to be(true)
    wait_for_selector(".status-actions__menu").click
    # edit status name
    wait_for_selector(".status-actions__edit").click
    update_field("#edit-status-dialog__status-name", "new status")
    wait_for_selector(".edit-status-dialog__submit").click
    wait_for_selector_none(".edit-status-dialog__dismiss")
    expect(@driver.page_source.include?('new status')).to be(true)
    expect(@driver.page_source.include?('Unstarted')).to be(false)
    #make another status as default
    wait_for_selector_list(".status-actions__menu")[3].click
    wait_for_selector(".status-actions__make-default").click
    #delete status
    wait_for_selector_list(".status-actions__menu")[2].click
    wait_for_selector(".status-actions__delete").click
    wait_for_selector_list(".status-actions__menu")[2].click
    wait_for_selector(".status-actions__delete").click
    @driver.navigate.to item_page
    wait_for_selector(".media-detail")
    wait_for_selector(".media-status__current").click
    wait_for_selector(".media-status__menu-item")
    ['Unstarted', 'Inconclusive','In Progress'].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(false)
    expect(@driver.page_source.include?('new status')).to be(true)
    end
  end
#status section end
end
