shared_examples 'tag' do
  it 'should manage and search team tags', bin6: true do
    # Create team and go to team page that should not contain any tag
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(false)

    # Create tag
    add_team_tag('newtag')
    wait_for_selector('.team-tags__row')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(true)

    # Edit tag
    expect(@driver.page_source.include?('newtagedited')).to be(false)
    wait_for_selector('.team-tags-actions__icon').click
    wait_for_selector('.team-tags-actions__edit').click
    wait_for_selector('#confirm-dialog__confirm-action-button')
    fill_field('#team-tags__name-input', 'edited')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    expect(@driver.page_source.include?('newtagedited')).to be(true)

    # Create another tag
    expect(@driver.page_source.include?('tag2')).to be(false)
    add_team_tag('tag2')
    expect(@driver.page_source.include?('2 / 2')).to be(true)
    expect(@driver.page_source.include?('tag2')).to be(true)

    # Search tag by keyword
    wait_for_selector('#search-input').send_keys('edited')
    @driver.action.send_keys(:enter).perform
    expect(@driver.page_source.include?('1 / 2')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(true)
    expect(@driver.page_source.include?('tag2')).to be(false)

    # Delete tag
    wait_for_selector('.team-tags-actions__icon').click
    wait_for_selector('.team-tags-actions__destroy').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    expect(@driver.page_source.include?('0 / 1')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(false)
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
  end

  it 'should add a tag rule and use tag filter', bin3: true, quick: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    # create a tag
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(false)
    wait_for_selector('#team-tags__create').click
    wait_for_selector('#confirm-dialog__confirm-action-button')
    fill_field('#team-tags__name-input', 'tag added automatically')
    wait_for_selector('.MuiAutocomplete-popupIndicator').click
    wait_for_selector('.MuiAutocomplete-inputFocused').click
    @driver.action.send_keys('item title contains').perform
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('textarea').send_keys('new media')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.team-tags__row')
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    # check that it does not have a item using this tag
    expect(wait_for_selector('td > a').text == '0').to be(true)
    tag_url = @driver.current_url
    # create a media
    wait_for_selector('.projects-list__all-items').click
    create_media('new media')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-tags__tag')
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    # click on the tag and go to search page with the tag filter and see the item
    wait_for_selector('.media-tags__tag').click
    wait_for_selector('#search-input')
    wait_for_selector('.multi-select-filter__tag')
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    expect(@driver.page_source.include?('new media')).to be(true)
    # go to team tag page and see one item using the tag
    @driver.navigate.to tag_url
    wait_for_selector('.team-tags__row')
    expect(wait_for_selector('td > a').text == '1').to be(true)
  end

  it 'should add a tag, reject duplicated and delete tag', bin3: true, quick: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    new_tag = "tag:#{Time.now.to_i}"
    # Validate assumption that tag does not exist
    expect(@driver.page_source.include?(new_tag)).to be(false)
    # Add tag
    add_tag(new_tag)
    @wait.until { @driver.page_source.include?(new_tag) }
    # Try to add duplicate
    wait_for_selector('.tag-menu__icon').click
    fill_field('#tag-input__tag-input', new_tag)
    @driver.action.send_keys(:enter).perform
    @wait.until { @driver.page_source.include?('Tag already exists') }
    wait_for_selector('.tag-menu__done').click
    # Verify that tag is not added and that error message is displayed
    wait_for_selector_none('#tag-input__tag-input')
    expect(@driver.find_elements(:class, 'media-tags__tag').length).to eq 1
    delete_tag(new_tag)
    wait_for_selector_none('.media-tags__tag')
    expect(@driver.find_elements(:class, 'media-tags__tag').length).to eq 0
  end
end
