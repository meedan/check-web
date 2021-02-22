shared_examples 'search' do
  it 'sort by date that the media was created', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('.date-range__start-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('.date-range__end-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('#search-query__submit-button').click
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should filter by status and search by keywords', bin2: true, quick: true do
    api_create_claim_and_go_to_search_page
    expect(@driver.page_source.include?('My search result')).to be(true)
    create_media('media 2')
    wait_for_selector_list('.medias__item')[0].click
    change_the_status_to('.media-status__menu-item--false', false)
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('#search-query__cancel-button')
    wait_for_selector('button[title=Open]').click
    wait_for_selector_list('.MuiOutlinedInput-input')[4].send_keys('verified')
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector_list('.MuiOutlinedInput-input')[4].send_keys('false')
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#search-query__submit-button').click
    expect(page_source_body.include?('My search result')).to be(false)
    attempts = 0
    @driver.navigate.refresh
    while !page_source_body.include?('media 2') && attempts < 30
      wait_for_selector('#search__open-dialog-button').click
      wait_for_selector('#search-query__cancel-button')
      if @driver.page_source.include?('False')
        wait_for_selector_list('.MuiChip-deletable > svg')[1].click
      else
        wait_for_selector_list('.MuiOutlinedInput-input')[4].send_keys('false')
        @driver.action.send_keys(:arrow_down).perform
        @driver.action.send_keys(:enter).perform
      end
      wait_for_selector('#search-query__submit-button').click
      sleep 1
      attempts += 1
    end
    expect(@driver.page_source.include?('media 2')).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector('#search__open-dialog-button').click
    selected = @driver.find_elements(:css, '.MuiChip-deletable')
    expect(selected.size == 1).to be(true)
    # reset filter
    wait_for_selector("//span[contains(text(), 'Reset')]", :xpath).click
    wait_for_selector('#search-query__submit-button').click
    wait_for_selector_list_size('.media__heading', 2)
    expect(@driver.page_source.include?('My search result')).to be(true)
    # search by keyword
    wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    wait_for_selector('#search-input').send_keys('search')
    @driver.action.send_keys(:enter).perform
    wait_for_selector_list_size('.media__heading', 1)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should filter item by status on trash page', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__send-to-trash').click
    wait_for_selector('.message').click
    wait_for_selector('.project-header__back-button').click
    expect(@driver.find_elements(:css, '.medias__item').empty?)
    wait_for_selector('.project-list__item-trash').click # Go to the trash page
    wait_for_selector('.media__heading')
    # use filter option
    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('#search-query__cancel-button')
    wait_for_selector_list('.MuiOutlinedInput-input')[4].send_keys('in progress')
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#search-query__submit-button').click
    wait_for_selector_none('#search-query__cancel-button')
    expect(page_source_body.include?('My search result')).to be(false)
    # reset filter
    @driver.navigate.refresh
    wait_for_selector('#search-input')
    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('#search-query__cancel-button')
    wait_for_selector('#search-query__reset-button').click
    wait_for_selector('#search-query__submit-button').click
    wait_for_selector_none('#search-query__cancel-button')
    wait_for_selector('.media__heading')
    expect(page_source_body.include?('My search result')).to be(true)
  end

  it 'should search and change sort criteria', bin2: true do
    api_create_claim_and_go_to_search_page
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)

    wait_for_selector('th[data-field=linked_items_count] span').click
    wait_for_selector('.medias__item')
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=created_at_timestamp] span').click
    wait_for_selector('.medias__item')
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search and change sort order', bin2: true do
    api_create_claim_and_go_to_search_page
    expect(@driver.current_url.to_s.match(/ASC|DESC/).nil?).to be(true)

    wait_for_selector('th[data-field=linked_items_count]').click
    wait_for_selector('.medias__item')
    expect(@driver.current_url.to_s.match(/DESC/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/ASC/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=linked_items_count]').click
    wait_for_selector('.medias__item')
    expect(@driver.current_url.to_s.match(/DESC/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/ASC/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search by status through URL', bin1: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.title =~ /False/).nil?).to be(true)
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022verification_status\u0022%3A%5B\u0022false\u0022%5D%7D"
    wait_for_selector('#search-query__clear-button')
    expect((@driver.title =~ /False/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('#search-query__cancel-button')
    selected = @driver.find_elements(:css, '.MuiChip-deletable')
    expect(selected.size == 1).to be(true)
  end

  it 'should search by date range', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)

    # Pre-populate dates to force the date picker to open at certain calendar months.
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D"
    wait_for_selector_none('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)

    wait_for_selector('#search__open-dialog-button').click
    wait_for_selector('.date-range__start-date input').click

    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('.date-range__end-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('#search-query__submit-button:not(:disabled)').click
    wait_for_selector_none('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)
  end

  it 'should change search sort and search criteria through URL', bin3: true do
    api_create_claim_and_go_to_search_page
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022related\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('#create-media__add-item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').length).to eq 1
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').empty?).to be(true)

    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022recent_added\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('#create-media__add-item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').empty?).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').length).to eq 1
  end

  it 'should search for reverse images', bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://twitter.com/Megadeth/status/1351583846718869504'
    card = wait_for_selector_list('.media-detail').length
    expect(card == 1).to be(true)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
    current_window = @driver.window_handles.last
    wait_for_selector("//span[contains(text(), 'Image Search')]", :xpath).click
    @driver.switch_to.window(@driver.window_handles.last)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
    @driver.switch_to.window(current_window)
  end

  it 'should find all medias with an empty search', bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search__open-dialog-button')
    create_image('test.png')
    old = wait_for_selector_list('.medias__item').length
    wait_for_selector('#search-input').click
    @driver.action.send_keys(:enter).perform
    current = wait_for_selector_list('.medias__item').length
    expect(old == current).to be(true)
    expect(current.positive?).to be(true)
  end
end
