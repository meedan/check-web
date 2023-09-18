shared_examples 'media actions' do
  it 'should create an item and assign it', bin4: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.test__media')
    expect(@driver.page_source.include?('Assignments updated successfully')).to be(false)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign').click
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Assignments updated successfully')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector('.annotation__timestamp')
    expect(@driver.page_source.include?('Item assigned to')).to be(true)
  end

  it 'should refresh media', bin1: true do
    api_create_team_and_bot_and_link_and_redirect_to_media_page({ url: 'http://api:3000/test/random' })
    title1 = wait_for_selector('.media-card-large__title').text
    expect((title1 =~ /Test/).nil?).to be(false)
    wait_for_selector('.media-actions__refresh').click
    wait_for_text_change(title1, '.media-card-large__title')
    title2 = wait_for_selector('.media-card-large__title').text
    expect((title2 =~ /Test/).nil?).to be(false)
    expect(title1 != title2).to be(true)
  end

  it 'should autorefresh media when annotation is created', bin3: true do
    api_create_team_and_claim_and_redirect_to_media_page
    url = @driver.current_url
    wait_for_selector('.media-card-large')
    expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
    current_window = @driver.window_handles.last
    @driver.execute_script("window.open('#{url}')")
    @driver.switch_to.window(@driver.window_handles.last)
    wait_for_selector('.media-tab__comments').click
    fill_field('#cmd-input', 'Auto-Refresh')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotations__list-item')
    @driver.execute_script('window.close()')
    @driver.switch_to.window(current_window)
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation__card-activity-comment')
    expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
  end

  it 'should lock and unlock status', bin2: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.test__media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign')
    expect(@driver.page_source.include?('Lock status')).to be(true)
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector_none('.media-actions__assign') # wait for close dialog
    wait_for_selector('.media-actions__icon').click
    expect(@driver.page_source.include?('Unlock status')).to be(true)
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector_none('.media-actions__assign') # wait for close dialog
    wait_for_selector('.media-actions__icon').click
    expect(@driver.page_source.include?('Lock status')).to be(true)
    expect(@driver.page_source.include?('Unlock status')).to be(false)
  end

  it 'should add and delete note', bin3: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-card-large')
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotations__list')
    fill_field('#cmd-input', 'A comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation--comment')
    expect(@driver.page_source.include?('A comment')).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.media-card-large')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation--comment')
    expect(@driver.page_source.include?('A comment')).to be(true)
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    expect(@driver.page_source.include?('A comment')).to be(false)
    @driver.navigate.refresh
    wait_for_selector('.media-card-large')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    wait_for_selector('.media-tab__comments').click
    expect(@driver.page_source.include?('A comment')).to be(false)
  end

  it 'should add image to media comment', bin3: true do
    api_create_team_and_claim_and_redirect_to_media_page
    # First, verify that there isn't any comment with image
    expect(@driver.page_source.include?('This is my comment with image')).to be(false)
    wait_for_selector('.media-tab__comments').click
    old = @driver.find_elements(:class, 'annotations__list-item').length
    wait_for_selector('.media-tab__comments').click
    # Add a comment as a command
    fill_field('#cmd-input', 'This is my comment with image')
    wait_for_selector('.add-annotation__insert-photo').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'files/test.png'))
    wait_for_selector('#add-annotation_submit').click
    wait_for_selector_none('.with-file')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_size_change(old, 'annotations__list-item', :class)
    wait_for_selector('#item-history__close-button').click

    # Verify that comment was added to annotations list
    wait_for_selector('.media-tab__comments').click
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    # verify link and text
    imgtext = @driver.find_element(:css, '.annotation__card-file').text
    expect(imgtext.match(/test\.png$/).nil?).to be(false)
    imgsrc = @driver.find_element(:css, '.annotation__card-file').attribute('href')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector('.media__annotations-column')
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation--card')
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgtext = @driver.find_element(:css, '.annotation__card-file').text
    expect(imgtext.match(/test\.png$/).nil?).to be(false)
    imgsrc = @driver.find_element(:css, '.annotation__card-file').attribute('href')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)
  end

  it 'should not create duplicated media', bin1: true do
    api_create_team_and_bot_and_link_and_redirect_to_media_page({ url: @media_url })
    id1 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1.positive?).to be(true)
    wait_for_selector('.media-card-large')
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('.search__results')
    wait_for_selector('.medias__item')
    wait_for_selector('#create-media__add-item').click
    fill_field('#create-media-input', @media_url)
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector('.media-card-large')
    id2 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1 == id2).to be(true)
  end
end
