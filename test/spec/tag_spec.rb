shared_examples 'tag' do
  it 'should manage and search team tags', bin2: true do
    # Create team and go to team page that should not contain any tag
    team = "team#{Time.now.to_i}-#{rand(99_999)}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(false)

    # Create tag
    add_team_tag('newtag')
    wait_for_selector('.team-tags__row')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(false)
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

    # Delete tag
    wait_for_selector('.team-tags-actions__icon').click
    wait_for_selector('.team-tags-actions__destroy').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    expect(@driver.page_source.include?('newtagedited')).to be(false)
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
  end

  it 'should add a tag rule and use tag filter', bin3: true, quick: true do
    team = "team#{Time.now.to_i}-#{rand(99_999)}"
    create_team_and_go_to_settings_page(team)
    # create a tag
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.team-tags__row').empty?).to be(true)
    wait_for_selector('#team-tags__create').click
    wait_for_selector('#confirm-dialog__confirm-action-button')
    fill_field('#team-tags__name-input', 'tag added automatically')
    wait_for_selector('.MuiAutocomplete-popupIndicator').click
    wait_for_selector('.MuiAutocomplete-inputFocused').click
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('textarea').send_keys('new media')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.team-tags__row')
    wait_for_selector('#side-navigation__toggle').click
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    # check that it does not have a item using this tag
    expect(wait_for_selector('td > a').text == '0').to be(true)
    # create a media
    wait_for_selector('.projects-list__all-items').click
    create_media('new media')
    sleep 60 # wait for the items to be indexed in the Elasticsearch
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-tags__tag')
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    wait_for_selector('.tag-menu__icon')
    # click on the tag and go to search page with the tag filter and see the item
    wait_for_selector('.media-tags__tag').click
    wait_for_selector('.media__heading', :css, 20, true)
    wait_for_selector('#search-input')
    wait_for_selector('.multi-select-filter__tag')
    expect(@driver.page_source.include?('tag added automatically')).to be(true)
    expect(@driver.page_source.include?('new media')).to be(true)
  end

  it 'should add a tag, reject duplicated tag', bin3: true, quick: true do
    api_create_team_project_claim_and_media_tag
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-card-large')
    # Try to add duplicate
    wait_for_selector('.tag-menu__icon').click
    fill_field('.multiselector__search-input input', 'TAG')
    wait_for_selector('#tag-menu__create-button').click
    @driver.action.send_keys(:enter).perform
    # Verify that 'Tag already exists' message is displayed
    @wait.until { @driver.page_source.include?('Tag already exists') }
  end
end
