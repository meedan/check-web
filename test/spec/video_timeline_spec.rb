shared_examples 'videotimeline' do
  it 'should manage video notes', bin6: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.youtube.com/watch?v=em8gwDcjPzU'
    @driver.manage.window.maximize
    wait_for_selector('.media-detail')
    wait_for_selector("//span[contains(text(), 'Timeline')]", :xpath).click
    wait_for_selector('div[aria-labelledby=TimelineTab]')
    expect(@driver.page_source.include?('Timeline')).to be(true)
    # add a note
    wait_for_selector('button[data-testid=new-comment-thread-button]').click
    wait_for_selector('#comment').send_keys('my note')
    @driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')
    wait_for_selector("//button/span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector('.MuiAvatar-circle')
    expect(@driver.find_elements(:class, 'MuiAvatar-circle').size).to eq 1
    wait_for_selector('.MuiIconButton-sizeSmall').click # close timeline button
    @driver.navigate.refresh
    wait_for_selector('#video-media-card__playback-rate')
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation__card-content')
    expect(@driver.page_source.include?('my note')).to be(true) # check the video note appears on the note tab
    wait_for_selector("//span[contains(text(), 'Timeline')]", :xpath).click
    wait_for_selector('div[data-testid=entities-tags]')
    wait_for_selector('.MuiAvatar-img').click
    # add a new note
    wait_for_selector('#comment').send_keys('new note')
    wait_for_selector("//button/span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector("//p[contains(text(), 'new note')]", :xpath)
    # delet note
    wait_for_selector("button[aria-label='Delete thread']").click
    wait_for_selector_none('.MuiAvatar-circle')
    expect(@driver.find_elements(:class, 'MuiAvatar-circle').size).to eq 0
    wait_for_selector('button.MuiIconButton-sizeSmall').click # close timeline button
    @driver.navigate.refresh
    wait_for_selector('.media-detail')
    wait_for_selector('.media-tab__comments').click
    expect(@driver.page_source.include?('my note')).to be(false) # check the video note disappears from the comments tab
  end

  it 'should manage videotags', bin6: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.youtube.com/watch?v=em8gwDcjPzU'
    @driver.manage.window.maximize
    wait_for_selector('.media-detail')
    expect(@driver.page_source.include?('my videotag')).to be(false)
    wait_for_selector("//span[contains(text(), 'Timeline')]", :xpath).click
    wait_for_selector('div[aria-labelledby=TimelineTab]')
    expect(@driver.page_source.include?('Timeline')).to be(true)
    # add a videotag
    wait_for_selector('div[data-testid=entities-tags]')
    wait_for_selector('button[data-testid=new-tag-button]').click
    wait_for_selector('#tag-suggestions').send_keys('my videotag')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//p[contains(text(), 'my videotag')]", :xpath)
    wait_for_selector('.MuiIconButton-sizeSmall').click # close timeline button
    wait_for_selector('.MuiChip-icon')
    wait_for_selector('#video-media-card__playback-rate')
    expect(@driver.page_source.include?('my videotag')).to be(true) # check the videotag appears on the page
    wait_for_selector('.MuiChip-icon').click
    wait_for_selector('div[aria-labelledby=TimelineTab]')
    expect(@driver.page_source.include?('Timeline')).to be(true)
    wait_for_selector('button.MuiIconButton-sizeSmall').click # close timeline button
    wait_for_selector("//span[contains(text(), 'my videotag')]", :xpath).click
    wait_for_selector('#search-input')
    expect(@driver.current_url.to_s.match(/all-items/).nil?).to be(false) # check the redirect
  end
end
