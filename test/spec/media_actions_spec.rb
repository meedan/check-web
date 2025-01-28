shared_examples 'media actions' do
  it 'should create an item and assign it', bin4: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.test__media')
    expect(@driver.page_source.include?('Assignments updated successfully')).to be(false)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign').click
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.int-multiselector__button--save').click
    wait_for_selector('.int-flash-message__toast')
    expect(@driver.page_source.include?('Assignments updated successfully')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector('.test-annotation__timestamp')
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

  it 'should lock and unlock status', bin2: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.test__media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign')
    expect(@driver.page_source.include?('Lock status')).to be(true)
    wait_for_selector('.media-actions__lock-status').click
    @driver.navigate.refresh
    wait_for_selector('.test__media')
    wait_for_selector('.media-actions__icon').click
    expect(@driver.page_source.include?('Unlock status')).to be(true)
    wait_for_selector('.media-actions__lock-status').click
    @driver.navigate.refresh
    wait_for_selector('.test__media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign')
    expect(@driver.page_source.include?('Lock status')).to be(true)
    expect(@driver.page_source.include?('Unlock status')).to be(false)
  end

  it 'should not create duplicated media', bin1: true do
    api_create_team_and_bot_and_link_and_redirect_to_media_page({ url: @media_url })
    id1 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1.positive?).to be(true)
    wait_for_selector('.media-card-large')
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('.search__results')
    wait_for_selector('.cluster-card')
    wait_for_selector('#create-media-button__open-button').click
    fill_field('#create-media-input', @media_url)
    wait_for_selector('#create-media-button__submit-button').click
    wait_for_selector('.media-card-large')
    id2 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1 == id2).to be(true)
  end
end
