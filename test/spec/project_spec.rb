shared_examples 'project' do
  it 'should create and set filters to a filtered list', bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page({ use_default_project: true })
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('#search-input')
    wait_for_selector('.projects-list')
    wait_for_selector('#projects-list__add-filtered-list').click
    wait_for_selector('#new-project__title').send_keys('Filtered list')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('div[title="Filtered list"]')
    wait_for_selector('.medias__item')
    expect(@driver.find_elements(:css, '.medias__item').size == 1).to be(true)
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('#in_progress').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    expect(@driver.find_elements(:css, '.medias__item').empty?).to be(true)
    # save list
    wait_for_selector('#save-list__button').click
    wait_for_selector('.confirm-proceed-dialog__cancel')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    @driver.navigate.refresh
    wait_for_selector('.project-list__link')
    expect(@driver.find_elements(:css, '.media__heading').empty?).to be(true)
  end

  it 'should paginate all-items page', bin4: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page({ count: 51 })
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

  it 'should manage custom search columns', bin4: true do
    api_create_team_project_metadata_and_claim({ quote: 'item item' })
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
    wait_for_selector('.reorder__button-down')
    wait_for_selector('p[title="Report status"]')
    wait_for_selector_list("//p[contains(text(), 'metadata')]/../../../div/button", :xpath)[0].click
    wait_for_selector_list("//span[contains(text(), 'Hide')]", :xpath)[0].click
    wait_for_selector_list("//span[contains(text(), 'Hide')]", :xpath)[1].click
    wait_for_selector('#team-lists__item-4-status button').click
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.message')
    wait_for_selector('#side-navigation__toggle').click
    wait_for_selector('.projects-list')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    @driver.navigate.refresh
    wait_for_selector('.media__heading')
    expect(@driver.page_source.include?('Status')).to be(false)
    expect(@driver.page_source.include?('metadata')).to be(true)
    expect(@driver.page_source.include?('answer')).to be(true)
  end
end
