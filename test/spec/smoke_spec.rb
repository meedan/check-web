require_relative './spec_helper.rb'
require_relative './app_spec_helpers.rb'
require_relative './api_helpers.rb'

shared_examples 'smoke' do

  include AppSpecHelpers
  include ApiHelpers

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

  it "should create a new media using a link from Facebook", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.facebook.com/FirstDraftNews/posts/1808121032783161')
    wait_for_selector(".media-detail__card-header")
    wait_for_selector("svg[alt='facebook.com']")
    expect(@driver.page_source.include?('First Draft')).to be(true)
    wait_for_selector(".media-detail__check-added-by")
    expect(@driver.page_source.include?('User With Email')).to be(true)
  end

  it "should create a new media using a link from Twitter", bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://twitter.com/TheWho/status/890135323216367616')
    wait_for_selector(".media-detail__card-header")
    wait_for_selector("svg[alt='twitter.com']")
    expect(@driver.page_source.include?('The Who')).to be(true)
    wait_for_selector(".media-detail__check-added-by")
    expect(@driver.page_source.include?('User With Email')).to be(true)
  end

  it "should create a new media using a link from Youtube", bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.youtube.com/watch?v=ykLgjhBnik0')
    wait_for_selector(".media-detail__card-header")
    wait_for_selector("svg[alt='youtube.com']")
    expect(@driver.page_source.include?('First Draft')).to be(true)
    wait_for_selector(".media-detail__check-added-by")
    expect(@driver.page_source.include?('User With Email')).to be(true)
  end

  it "should create a new media using a link from Instagram", bin3: true do
    api_create_team_project_and_link_and_redirect_to_media_page('https://www.instagram.com/p/BRYob0dA1SC/')
    wait_for_selector(".media-detail__card-header")
    wait_for_selector("svg[alt='instagram.com']")
    expect(@driver.page_source.include?('ironmaiden')).to be(true)
    wait_for_selector(".media-detail__check-added-by")
    expect(@driver.page_source.include?('User With Email')).to be(true)
  end

  it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
    page = api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector("add-annotation__insert-photo",:class)
    new_tag = Time.now.to_i.to_s
    # Validate assumption that tag does not exist
    expect(page.has_tag?(new_tag)).to be(false)
    # Add tag
    page.add_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(true)
    # Try to add duplicate
    page.add_tag(new_tag)
    @wait.until { @driver.page_source.include?('Validation') }
    expect(page.contains_string?('Tag already exists')).to be(true)
    # Verify that tag is not added and that error message is displayed
    expect(page.tags.count(new_tag)).to be(1)
    page.delete_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(false)
  end

  it "should comment media as a command", bin4: true, quick:true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.create-task__add-button')
    # First, verify that there isn't any comment
    expect(@driver.page_source.include?('This is my comment')).to be(false)
    old = wait_for_selector_list('.annotations__list-item')

    # Add a comment as a command
    fill_field('#cmd-input', '/comment This is my comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".annotation__card-content")
    wait_for_size_change(old,'.annotations__list-item')

    # Verify that comment was added to annotations list
    expect(@driver.page_source.include?('This is my comment')).to be(true)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector('.annotations__list-item')
    expect(@driver.page_source.include?('This is my comment')).to be(true)
  end

  it "should update notes count after delete annotation", bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media__annotations-column")
    fill_field('#cmd-input', 'Test')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation--comment')
    notes_count_before = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
    expect(notes_count_before > 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector('.annotation__deleted')
    notes_count_after = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
    expect(notes_count_after > 0).to be(true)
    expect(notes_count_after == notes_count_before).to be(true) # Count should be the same because the comment is replaced by the "comment deleted" annotation
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it "should set a verification status for one media" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail__card-header")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    wait_for_selector(".media-status__label > div button svg").click
    wait_for_selector(".media-status__menu-item")
    wait_for_selector(".media-status__menu-item--in-progress").click
    wait_for_selector_none(".media-status__menu-item")
    expect(@driver.page_source.include?('In Progress')).to be(true)
  end

end
