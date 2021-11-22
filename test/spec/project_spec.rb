shared_examples 'project' do
  it 'should create, edit and remove a collection', bin2: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#search-form')
    expect(@driver.page_source.include?('Test Project')).to be(true)
    expect(@driver.page_source.include?('collection A')).to be(false)
    # create a collection
    create_folder_or_collection('collection A', '.projects-list__add-collection')
    # move a folder to a collection
    wait_for_selector_list('.project-list__link')[1].click
    wait_for_selector('.project__title-text')
    wait_for_selector('button.project-actions').click
    expect(@driver.find_elements(:css, '.project-actions__move-out').length.zero?).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.search__form')
    move_folder_to_collection('collection A')
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    # remove folder from collection
    wait_for_selector('button.project-actions').click
    expect(@driver.find_elements(:css, '.project-actions__move-out').length.zero?).to be(false)
    wait_for_selector('.project-actions__move-out').click
    wait_for_selector_none('.project-actions__move-out')
    # move folder for the collection again
    move_folder_to_collection('collection A')
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    expect(@driver.page_source.include?('collection A')).to be(true)
    # delete collection and check that the folder is still available
    wait_for_selector('.project-list__link').click
    wait_for_selector('.project__title-text')
    wait_for_selector('button.project-actions').click
    wait_for_selector('.project-actions__destroy').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    expect(@driver.find_elements(:css, '.project-list__link').length).to eq 1
    expect(@driver.page_source.include?('collection A')).to be(false)
    expect(@driver.page_source.include?('Test Project')).to be(true)
  end

  it 'should edit collection', bin1: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#search-form')
    # create a collection
    create_folder_or_collection('collection A', '.projects-list__add-collection')
    expect(@driver.page_source.include?('collection A- edited')).to be(false)
    # edit collection name
    expect(@driver.page_source.include?('collection A- edited')).to be(false)
    wait_for_selector('.project-list__link').click
    edit_project(title: 'collection A- edited', description: '')
    expect(@driver.page_source.include?('Set description')).to be(false)
    # edit collection description
    edit_project(description: "Set description #{Time.now.to_i}")
    expect(@driver.page_source.include?('Set description')).to be(true)
  end

  it 'should create and set filters to a filtered list', bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#projects-list__add-filtered-list').click
    wait_for_selector('#new-project__title').send_keys('Filtered list')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
    wait_for_selector_list('.project-list__link')[1].click
    wait_for_selector('div[title="Filtered list"]')
    url = @driver.current_url.to_s
    wait_for_selector('.medias__item')
    expect(@driver.find_elements(:css, '.medias__item').size == 1).to be(true)
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('#in_progress').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    expect(@driver.find_elements(:css, '.medias__item').empty?).to be(true)
    # clear filter
    wait_for_selector('#search-fields__clear-button').click
    wait_for_selector('.medias__item')
    expect(@driver.find_elements(:css, '.medias__item').size == 1).to be(true)
    expect(@driver.page_source.include?('Item status is')).to be(false)
    # set a new filter and save list
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__media-type').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('#links').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector_none('.medias__item')
    expect(@driver.find_elements(:css, '.medias__item').empty?).to be(true)
    # save list
    wait_for_selector('#save-list__button').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    @driver.navigate.to url
    wait_for_selector('.project-list__link')
    expect(@driver.find_elements(:css, '.media__heading').empty?).to be(true)
  end

  it 'should redirect to last visited folder', bin3: true do
    user = api_register_and_login_with_email
    api_create_team_and_project(user: user)
    api_create_team_and_project(user: user)

    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('#teams-tab').click
    wait_for_selector('.switch-teams__joined-team')
    wait_for_selector_list('.teams a').first.click
    wait_for_selector('.project__title')
    wait_for_selector('.project-list__link-trash')
    wait_for_selector('.project__title')
    wait_for_selector('.team-header__drawer-team-link').click
    wait_for_selector('.project-list__link').click
    wait_for_selector_none('.team-members__edit-button', :css, 10)

    @driver.navigate.to("#{@config['self_url']}/check/me")
    wait_for_selector('#teams-tab').click
    wait_for_selector('.switch-teams__joined-team')
    wait_for_selector_list('.teams a').last.click
    wait_for_selector('.project__title')
    wait_for_selector('.project-list__link-trash')
    wait_for_selector('.team-header__drawer-team-link').click

    @driver.navigate.to(@config['self_url'])
    wait_for_selector('.project__title')
    notfound = "#{@config['self_url']}/check/404"
    expect(@driver.current_url.to_s == notfound).to be(false)
  end

  it 'should edit folder', bin4: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    new_title = "Changed title #{Time.now.to_i}"
    new_description = "Set description #{Time.now.to_i}"
    wait_for_selector('#search-input')
    expect(@driver.page_source.include?(new_title)).to be(false)
    expect(@driver.page_source.include?(new_description)).to be(false)
    # 7204 edit title and description separately
    edit_project(title: new_title, description: '')
    expect(@driver.page_source.include?('Changed title')).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(false)
    wait_for_selector('.project-actions', :css)
    # 7204 edit title and description separately
    edit_project(description: new_description)
    wait_for_selector('.Linkify')
    expect(@driver.page_source.include?('Changed title')).to be(true)
    expect(@driver.page_source.include?(new_description)).to be(true)
  end

  it 'should paginate folder page', bin4: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page 51, 0
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading')
    wait_for_selector("//span[contains(text(), '1 - 50 / 51')]", :xpath)
    expect(@driver.page_source.include?('1 - 50 / 51')).to be(true)
    wait_for_selector('.search__next-page').click
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading')
    wait_for_selector("//span[contains(text(), '51 - 51 / 51')]", :xpath)
    expect(@driver.page_source.include?('51 - 51 / 51')).to be(true)
  end

  it 'should manage custom folder columns', bin4: true do
    api_create_team_project_metadata_and_media('https://twitter.com/check/status/1255094026497413120')
    wait_for_selector('#create-media__add-item')
    wait_for_selector('.media__heading')
    expect(@driver.page_source.include?('Status')).to be(true)
    expect(@driver.page_source.include?('metadata')).to be(false)
    expect(@driver.page_source.include?('answer')).to be(false)
    wait_for_selector('.media__heading').click
    # answer the metadata
    wait_for_selector('.form-edit').click
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('#metadata-input').send_keys('answer')
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-cancel', 2)
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/settings"
    wait_for_selector('.team')
    wait_for_selector('.team-settings__lists-tab').click
    wait_for_selector_list("//span[contains(text(), 'Show')]", :xpath)[9].click
    wait_for_selector('#team-lists__item-4-status button').click
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.message')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    wait_for_selector('.media__heading')
    expect(@driver.page_source.include?('Status')).to be(false)
    expect(@driver.page_source.include?('metadata')).to be(true)
    expect(@driver.page_source.include?('answer')).to be(true)
  end
end
