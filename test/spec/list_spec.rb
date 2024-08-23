shared_examples 'list' do
  it 'should save filters to a list', bin1: true do
    api_create_team_and_claim_and_redirect_to_media_page
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.list-sort-desc').empty?).to be(true)
    wait_for_selector('.list-sort-asc').click
    wait_for_selector('#save-list__button').click
    wait_for_selector('#new-list__title').send_keys('Filtered list')
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('li[title="Filtered list"]')
    wait_for_selector('.cluster-card')
    expect(@driver.find_elements(:css, '.cluster-card').size == 1).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.list-sort-desc')
    expect(@driver.find_elements(:css, '.cluster-card').size == 1).to be(true)
    expect(@driver.find_elements(:css, '.list-sort-desc').empty?).to be(false)
  end

  it 'should paginate all-items page', bin4: true do
    api_create_team_claims_sources_and_redirect_to_all_items({ count: 51 })
    wait_for_selector('.search__results-heading')
    wait_for_selector('.cluster-card')
    wait_for_selector("//span[contains(text(), '1 - 50 / 51')]", :xpath)
    expect(@driver.page_source.include?('1 - 50 / 51')).to be(true)
    wait_for_selector('.search__next-page').click
    wait_for_selector('.search__results-heading')
    wait_for_selector('.cluster-card')
    wait_for_selector("//span[contains(text(), '51 - 51 / 51')]", :xpath)
    expect(@driver.page_source.include?('51 - 51 / 51')).to be(true)
  end
end
