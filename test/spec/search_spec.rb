shared_examples 'search' do
  it 'sort by date that the media was created', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__time-range').click
    wait_for_selector('.int-date-filter__button--start-date').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('.int-date-filter__button--end-date').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search by keywords', bin4: true, quick: true do
    api_create_team_claims_sources_and_redirect_to_all_items({ count: 2 })
    verbose_wait # wait for the items to be indexed in Elasticsearch
    # find all medias with an empty search
    wait_for_selector('.medias__item', :css, 20, true)
    wait_for_selector('#search-input').click
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.medias__item', :css, 20, true)
    expect(@driver.find_elements(:css, '.media__heading').size).to eq 2
    # search by keywords
    wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    wait_for_selector('#search-input').send_keys('Claim 0')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.medias__item', :css, 20, true)
    expect(@driver.find_elements(:css, '.media__heading').size).to eq 1
  end

  it 'should search and change sort criteria', bin4: true do
    api_create_claim_and_go_to_search_page
    verbose_wait # wait for the items to be indexed in Elasticsearch
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)

    wait_for_selector('th[data-field=linked_items_count] span').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=created_at_timestamp] span').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').length).to eq 1

    # change sort criteria through URL
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022related\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').empty?).to be(true)
  end

  it 'should search by relative date range', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    # Pre-populate with items created in the last 3 days, so will show our just-made item
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22condition%22%3A%22less_than%22%2C%22period%22%3A3%2C%22period_type%22%3A%22d%22%7D%7D%7D"
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('input[value="3"]').click
    # Switch to six days, hit submit button, make sure that works too
    wait_for_selector('input[value="3"]').send_keys(:control, 'a', :delete, '6')
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search for reverse images', bin2: true do
    api_create_team_and_bot
    @driver.navigate.to "#{@config['self_url']}/#{@slug}/settings/workspace"
    create_image('files/test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
    current_window = @driver.window_handles.last
    wait_for_selector('#media-expanded-actions__menu').click
    wait_for_selector('#media-expanded-actions__reverse-image-search').click
    @driver.switch_to.window(@driver.window_handles.last)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
    @driver.switch_to.window(current_window)
  end

  it 'should search by status', bin1: true do
    api_create_team_claims_sources_and_redirect_to_all_items({ count: 2 })
    sleep 30 # wait for the items to be indexed in Elasticsearch
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-card-large')
    api_change_media_status
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.media__heading').size).to eq 2
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.int-multi-select-filter__button--select-dropdown').click
    wait_for_selector('input#false').click
    wait_for_selector('.int-multiselector__button--save').click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.multi-select-filter')
    expect(@driver.find_elements(:css, '.media__heading').size).to eq 1
    # search by status through URL
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022verification_status\u0022%3A%5B\u0022false\u0022%5D%7D"
    wait_for_selector('.medias__item')
    expect(@driver.find_elements(:css, '.media__heading').size).to eq 1
  end
end
