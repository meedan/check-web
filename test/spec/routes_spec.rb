shared_examples 'routes' do
  it 'should load route :check/me(/:tab)', bin1: true do
    api_register_and_login_with_email
    @driver.navigate.to "#{@config['self_url']}/check/me/edit"
    wait_for_selector('.source__edit-buttons-cancel-save')
    expect(@driver.find_elements(:css, '#source__name-container').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/profile"
    wait_for_selector('.route__me')
    expect(@driver.find_elements(:css, '#source__name-container').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/privacy"
    wait_for_selector('.route__me')
    expect(@driver.find_elements(:css, '#user__privacy').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/security"
    wait_for_selector('.route__me')
    expect(@driver.find_elements(:css, '#user__security').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/check/me/workspaces"
    wait_for_selector('.route__me')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :check/user/confirm/:confirmType', bin1: true do
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

  it 'should load route :check/user/password-change', bin1: true do
    api_register_and_login_with_email
    @driver.navigate.to "#{@config['self_url']}/check/user/password-change"
    wait_for_selector('#password-change-password-input')
    expect(@driver.find_elements(:css, '.user-password-change__card').empty?).to be(false)
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/media/:mediaId/{tab}', bin1: true do
    data = api_create_team_and_bot
    pm1 = api_create_claim(data: data, quote: 'claim 1')
    # pm2 = api_create_claim(data: data, quote: 'claim 2')
    # api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm2.id)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/metadata"
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test-label__button').empty?).to be(false)
  
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/tasks"
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test-label__button').empty?).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/source"
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.test-label__button').empty?).to be(false)

    # @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}/similar-midia"
    # wait_for_selector('.similarity-bar__matches-count')
    # expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    # expect(@driver.find_elements(:css, '.test-label__button').empty?).to be(false)
  end

  it 'should load route :team/list', bin1: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.test__media')
    @driver.action.move_to(wait_for_selector('.project-list__header')).perform # hover element
    wait_for_selector('#projects-list__add-filtered-list').click
    wait_for_selector('#new-project__title').send_keys('List 01')
    wait_for_selector('#confirm-dialog__confirm-action-button').click

    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    # http://localhost:3333/test-team-1742901676-6461/list/5/media/45?listIndex=0&tab=articles
    # Get the current URL
    url = @driver.current_url.to_s
    base_url = url.match(%r{^(http://[^/]+/[^/]+/list/\d+/media/\d+)}).to_s
    puts "Base URL: #{base_url}"

    @driver.navigate.to "#{base_url}"
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    # Use the base_url to build new URLs
    new_url = "#{base_url}/metadata"
    puts "New URL: #{new_url}"
    @driver.navigate.to new_url
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    new_url = "#{base_url}/tasks"
    @driver.navigate.to new_url
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    new_url = "#{base_url}/source"
    @driver.navigate.to new_url
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    new_url = "#{base_url}/similar-media"
    @driver.navigate.to new_url
    wait_for_selector('.route__media')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/articles/{tab}', bin1: true do
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

  it 'should load route :team/{tab}', bin1: true do
    data = api_create_team_and_bot
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/dashboard"
    wait_for_selector('.recharts-responsive-container')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feed/create"
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)

    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/feeds"
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
  end

  it 'should load route :team/spam(/:query)', bin1: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/spam/#{query}"

    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/trash(/:query)', bin1: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/trash/#{query}"

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
  
  it 'should load route :team/suggested-matches(/:query)', bin1: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/suggested-matches/#{query}"
  
    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end

  it 'should load route :team/assigned-to-me(/:query)', bin1: true do
    data = api_create_team_and_bot
    query = '%7B%22archived%22%3A4%2C%22sort%22%3A%22recent_activity%22%2C%22sort_type%22%3A%22ASC%22%2C%22parent%22%3A%7B%22type%22%3A%22team%22%2C%22slug%22%3A%22fsaf%22%7D%7D'
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/assigned-to-me/#{query}"
  
    wait_for_selector('.search__list-header-filter-row')
    expect(@driver.page_source.include?('This page does not exist or you do not have authorized access.')).to be(false)
    expect(@driver.find_elements(:css, '.list-sort').empty?).to be(false)
  end
    
end
  