shared_examples 'status' do
  it 'should customize status', bin4: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.media-status__current').click
    wait_for_selector('.media-status__menu-item')
    ['Unstarted', 'Inconclusive', 'In Progress'].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(true)
    end
    expect(@driver.page_source.include?('new status')).to be(false)
    item_page = @driver.current_url
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/settings"
    wait_for_selector('.team-settings__statuses-tab').click
    wait_for_selector("//span[contains(text(), 'default')]", :xpath)
    expect(@driver.page_source.include?('Unstarted')).to be(true)
    wait_for_selector('.status-actions__menu').click
    # edit status name
    wait_for_selector('.status-actions__edit').click
    update_field('#edit-status-dialog__status-name', 'new status')
    wait_for_selector('.edit-status-dialog__submit').click
    wait_for_selector('.confirm-proceed-dialog__proceed').click
    wait_for_selector_none('.edit-status-dialog__dismiss')
    expect(@driver.page_source.include?('new status')).to be(true)
    expect(@driver.page_source.include?('Unstarted')).to be(false)
    # make another status as default
    wait_for_selector_list('.status-actions__menu')[3].click
    wait_for_selector('.status-actions__make-default').click
    # delete status
    wait_for_selector_list('.status-actions__menu')[2].click
    wait_for_selector('.status-actions__delete').click
    wait_for_selector_none('.status-actions__delete', :css, 3)
    wait_for_selector_list('.status-actions__menu')[2].click
    wait_for_selector('.status-actions__delete').click
    @driver.navigate.to item_page
    wait_for_selector('.media-detail')
    wait_for_selector('.media-status__current').click
    wait_for_selector('.media-status__menu-item')
    ['Unstarted', 'Inconclusive', 'In Progress'].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(false)
      expect(@driver.page_source.include?('new status')).to be(true)
    end
  end
end
