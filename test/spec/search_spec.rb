shared_examples 'search' do
  it 'sort by date that the media was created', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__time-range').click
    wait_for_selector('.date-range__start-date input').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('.date-range__end-date input').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('#search-fields__submit-button').click
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
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('input#verified').click
    wait_for_selector('input#false').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    expect(page_source_body.include?('My search result')).to be(false)
    wait_for_selector('.multi-select-filter')
    expect(@driver.page_source.include?('media 2')).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(false)
    selected = @driver.find_elements(:css, '.multi-select-filter__tag')
    expect(selected.size == 2).to be(true)
    # reset filter
    wait_for_selector('#search-fields__clear-button').click
    wait_for_selector_list_size('.media__heading', 2)
    expect(@driver.page_source.include?('My search result')).to be(true)
    # search by keyword
    wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    wait_for_selector('#search-input').send_keys('search')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should filter item by status on trash page', bin5: true do
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
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('input#in_progress').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.multi-select-filter')
    expect(page_source_body.include?('My search result')).to be(false)
    # reset filter
    @driver.navigate.refresh
    wait_for_selector('#search-input')
    wait_for_selector('#search-fields__clear-button').click
    wait_for_selector('.media__heading')
    expect(page_source_body.include?('My search result')).to be(true)
  end

  it 'should search and change sort criteria', bin5: true do
    api_create_claim_and_go_to_search_page
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)

    wait_for_selector('th[data-field=linked_items_count] span').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=created_at_timestamp] span').click
    wait_for_selector('.media__heading', :css, 20, true)
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
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/DESC/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/ASC/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=linked_items_count]').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/DESC/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/ASC/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search by status through URL', bin1: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.title =~ /False/).nil?).to be(true)
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022verification_status\u0022%3A%5B\u0022false\u0022%5D%7D"
    wait_for_selector('#search-fields__clear-button')
    expect((@driver.title =~ /False/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector('#search-fields__clear-button')
    selected = @driver.find_elements(:css, '.multi-select-filter__tag')
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

    wait_for_selector('.date-range__start-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('.date-range__end-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector_none('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)
  end

  it 'should change search sort and search criteria through URL', bin3: true do
    api_create_claim_and_go_to_search_page
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022related\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').length).to eq 1
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').empty?).to be(true)

    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022recent_added\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').empty?).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').length).to eq 1
  end

  it 'should search for reverse images', bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.globo.com/'
    card = wait_for_selector_list('.media-detail').length
    expect(card == 1).to be(true)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
    current_window = @driver.window_handles.last
    wait_for_selector('#media-expanded-actions__menu').click
    wait_for_selector('#media-expanded-actions__reverse-image-search').click
    @driver.switch_to.window(@driver.window_handles.last)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
    @driver.switch_to.window(current_window)
  end

  it 'should find all medias with an empty search', bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.project-header__back-button').click
    create_image('test.png')
    old = wait_for_selector_list('.medias__item').length
    wait_for_selector('#search-input').click
    @driver.action.send_keys(:enter).perform
    current = wait_for_selector_list('.medias__item').length
    expect(old == current).to be(true)
    expect(current.positive?).to be(true)
  end

  it 'should sort by title', bin1: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page 2
    wait_for_selector_list('.medias__item')
    claim1 = wait_for_selector_list('h4')[0].text
    claim2 = wait_for_selector_list('h4')[1].text
    expect(claim1 == 'Claim 1').to be(true)
    expect(claim2 == 'Claim 0').to be(true)
    wait_for_selector('.MuiTableSortLabel-iconDirectionDesc').click
    wait_for_text_change('Claim 1', 'h4')
    claim1 = wait_for_selector_list('h4')[0].text
    claim2 = wait_for_selector_list('h4')[1].text
    expect(claim1 == 'Claim 0').to be(true)
    expect(claim2 == 'Claim 1').to be(true)
  end

  # commented until #CHECK-852 be fixed
  # it 'should search by metadata uploaded file', bin1: true do
  #   data = api_create_team_and_project
  #   api_create_claim(data: data, quote: 'claim 1')
  #   @driver.navigate.to @config['self_url']
  #   wait_for_selector('.team-header__drawer-team-link').click
  #   # @driver.navigate.to "#{@config['self_url']}/#{data[:team].dbid}/all-items/settings/metadata"
  #   wait_for_selector('.team-menu__team-settings-button').click
  #   wait_for_selector('.team-settings__metadata-tab', :css, 30).click
  #   wait_for_selector("//span[contains(text(), 'metadata')]", :xpath)

  #   # Create metadata
  #   expect(@driver.page_source.include?('No metadata fields')).to be(true)
  #   expect(@driver.page_source.include?('my metadata')).to be(false)
  #   create_team_data_field(tab_class: '.team-settings__metadata-tab', task_type_class: '.edit-task-dialog__menu-item-file_upload', task_name: 'my metadata')
  #   expect(@driver.page_source.include?('No metadata fields')).to be(false)
  #   expect(@driver.page_source.include?('my metadata')).to be(true)

  #   api_create_claim(data: data, quote: 'claim 2')
  #   wait_for_selector('.projects-list__all-items').click
  #   wait_for_selector('.medias__item')
  #   expect(@driver.find_elements(:css, '.media__heading').size == 2).to be(true)

  #   wait_for_selector('.media__heading').click
  #   wait_for_selector('.media__annotations-tabs')
  #   wait_for_selector('.task__response-inputs')
  #   # answer the metadata
  #   # wait_for_selector('.task__response > div div').click
  #   # wait_for_selector("//span[contains(text(), 'Drag and drop a file here')]", :xpath).click
  #   # @driver.find_element(:name, 'File Upload').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
  #   el = @driver.find_element(:xpath, "//span[contains(text(), 'Drag and drop a file here')
  #   ]")
  #   @driver.action.move_to(el).perform
  #   wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
  #   sleep 10
  #   wait_for_selector_none('.without-file')
  #   wait_for_selector('#metadata-input').send_keys('answer')
  #   wait_for_selector('.metadata-save').click

  #   wait_for_selector('#search-input')
  #   wait_for_selector('#add-filter-menu__open-button').click
  #   wait_for_selector('#add-filter-menu__team-tasks').click
  #   wait_for_selector('.custom-select-dropdown__select-button').click
  #   wait_for_selector("//span[contains(text(), 'my metadata')]", :xpath).click
  #   wait_for_selector('.multi__selector-save').click
  #   wait_for_selector('.custom-select-dropdown__select-button').click
  #   wait_for_selector('.multi__selector-save').click
  #   wait_for_selector('#NO_VALUE').click
  #   wait_for_selector('#search-fields__submit-button').click
  #   wait_for_selector('.medias__item')
  #   expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  #   expect(@driver.page_source.include?('claim 1')).to be(true)
  #   expect(@driver.page_source.include?('claim 2')).to be(true)
  # end
end
