shared_examples 'routes' do
  it 'should load route :check/me(/:tab)', bin1: true do
    api_register_and_login_with_email
    @driver.navigate.to "#{@config['self_url']}/check/me/edit"
    wait_for_selector('.source__edit-buttons-cancel-save')
    expect(@driver.find_elements(:css, '#source__name-container').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/profile"
    wait_for_selector('.source__name-input')
    expect(@driver.find_elements(:css, '#source__name-container').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/privacy"
    wait_for_selector('.user-connect__list-item')
    expect(@driver.find_elements(:css, '#user__privacy').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/security"
    wait_for_selector('#password-change-password-input-current')
    expect(@driver.find_elements(:css, '#user__security').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/workspaces"
    wait_for_selector('.component__settings-header')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.home--me').empty?).to be(false)
  end

  it 'should load route :check/user/confirm/:confirmType', bin3: true do
    @driver.navigate.to "#{@config['self_url']}/check/user/confirm/confirmed"
    title = wait_for_selector('.confirm__heading')
    expect(title.text == 'Account Confirmed').to be(true)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/user/confirm/unconfirmed"
    unconfirmed_msg = wait_for_selector('.confirm_content').text
    expect(unconfirmed_msg.include?('Sorry, an error occurred while confirming your account')).to be(true)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/user/confirm/already-confirmed"
    title = wait_for_selector('.confirm__heading')
    expect(title.text == 'Account Already Confirmed').to be(true)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :check/user/password-change', bin2: true do
    api_register_and_login_with_email
    @driver.navigate.to "#{@config['self_url']}/check/user/password-change"
    wait_for_selector('#password-change-password-input')
    expect(@driver.find_elements(:css, '.user-password-change__card').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/media/:mediaId/{tab}', bin1: true do
    data = api_create_team_and_bot
    pm1 = api_create_claim(data: data, quote: 'claim 1')

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/metadata"
    wait_for_selector('.test-label__button')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, 'button').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/tasks"
    wait_for_selector('.test-label__button')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test-label__button').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/source"
    wait_for_selector('.test-label__button')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, 'button').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/similar-media"
    wait_for_selector('.media-card-large')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test__media').empty?).to be(false)
  end

  it 'should load route :team/list/media/mediaId/{tab}', bin2: true do
    create_list_and_item_and_redirect_to_list_page
    base_url = @driver.current_url.to_s
    base_url = base_url.match(%r{^(http://[^/]+/[^/]+/list/\d+/media/\d+)}).to_s

    new_url = "#{base_url}/metadata"
    @driver.navigate.to new_url
    wait_for_selector('.test-label__button')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, 'button').empty?).to be(false)

    new_url = "#{base_url}/tasks"
    @driver.navigate.to new_url
    wait_for_selector('.test-label__button')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, 'button').empty?).to be(false)

    new_url = "#{base_url}/source"
    @driver.navigate.to new_url
    wait_for_selector('#media_source-change')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '#media-source__create-button').empty?).to be(false)

    new_url = "#{base_url}/similar-media"
    @driver.navigate.to new_url
    wait_for_selector('.media-card-large')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test__media').empty?).to be(false)
  end

  it 'should load route :team/articles/{tab}', bin3: true do
    data = api_create_team_and_bot
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/articles/dashboard"
    wait_for_selector('.recharts-responsive-container')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/articles/imported-fact-checks"
    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/articles/published"
    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/dashboard', bin: true do
    data = api_create_team_and_bot
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/dashboard"
    wait_for_selector('.recharts-responsive-container')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/feeds', bin2: true do
    data = api_create_team_and_bot

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feed/create"
    wait_for_selector('#create-feed__description')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '#create-feed__title').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feeds"
    wait_for_selector('.projects-list__add-feed')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/spam(/:query)', bin3: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/spam/#{query}"

    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/tipline-inbox(/:query)', bin1: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/tipline-inbox/#{query}"

    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/suggested-matches(/:query)', bin2: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/suggested-matches/#{query}"

    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/assigned-to-me(/:query)', bin3: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/assigned-to-me/#{query}"

    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/bot', bin2: true do
    data = api_create_team(is_admin: true)
    @driver.navigate.to "#{@config['self_url']}/#{data.slug}/bot"
    wait_for_selector('.test__alert-content')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.contactId').empty?).to be(false)
  end

  it 'should load route :team/feed/{tab}', bin3: true do
    data = api_create_feed_with_item

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feed/#{data[:feed].feed['id']}/edit"
    wait_for_selector('#create-feed__description')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '#create-feed__title').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feed/#{data[:feed].feed['id']}/item/#{data[:feed].cluster['project_media_id']}"
    wait_for_selector('#feed-item-page-teams')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '#feed-item-page').empty?).to be(false)
  end

  it 'should load route :team/feed/invitation', bin3: true do
    data = api_create_feed_invitation
    user = data[:user2]
    team = data[:team]

    # log in with user 2
    @driver.navigate.to "#{api_path}session?email=#{user.email}"
    sleep 2

    @driver.navigate.to "#{@config['self_url']}/#{team.slug}/feed/#{data[:feed_invitation].feed['id']}/invitation"
    wait_for_selector('.feed-invitation-container-card')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.int-feed-invitation-respond__button--accept').empty?).to be(false)
  end
end
