shared_examples 'status' do
  it 'should customize status', bin4: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-card-large')
    wait_for_selector('.media-status__current').click
    wait_for_selector('.media-status__menu-item')
    ['Unstarted', 'Inconclusive', 'In Progress'].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(true)
    end
    expect(@driver.page_source.include?('new status')).to be(false)
    item_page = @driver.current_url
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/settings/statuses"
    wait_for_selector("//small[contains(text(), 'default')]", :xpath)
    expect(@driver.page_source.include?('Unstarted')).to be(true)
    wait_for_selector('.status-actions__menu').click
    # edit status name
    wait_for_selector('.status-actions__edit').click
    update_field('#edit-status-dialog__status-name', 'newStatus')
    wait_for_selector('.edit-status-dialog__submit').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('.edit-status-dialog__dismiss')
    expect(@driver.page_source.include?('newStatus')).to be(true)
    expect(@driver.page_source.include?('Unstarted')).to be(false)
    # make another status as default
    wait_for_selector_list('.status-actions__menu')[3].click
    wait_for_selector('.status-actions__make-default').click
    # delete status
    wait_for_selector_list('.status-actions__menu')[2].click
    wait_for_selector('.status-actions__delete').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('.status-actions__delete', :css, 3)
    @driver.navigate.to item_page
    wait_for_selector('.media-card-large')
    wait_for_selector('.media-status__current').click
    wait_for_selector('.media-status__menu-item')
    %w[newStatus Inconclusive Verified].each do |status_label|
      expect(@driver.page_source.include?(status_label)).to be(true)
    end
  end
end
