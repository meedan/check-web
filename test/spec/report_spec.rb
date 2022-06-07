shared_examples 'report' do
  it 'should set claim and fact check information for an item, and go to the report', bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    api_install_bot 'smooch'
    wait_for_selector('.media-detail')

    # Claim
    expect(@driver.page_source.include?('My claim description')).to be(false)
    wait_for_selector('#media-fact-check__title')
    wait_for_selector('#media-claim__description').send_keys('My claim description')
    wait_for_text_change(' ', '#media-claim__description', :css)
    wait_for_selector('#media__fact-check').click

    # Fact-check
    expect(@driver.page_source.include?('My fact-check title')).to be(false)
    expect(@driver.page_source.include?('My fact-check summary')).to be(false)
    wait_for_selector('#media-fact-check__title').send_keys('My fact-check title')
    wait_for_selector('#media-fact-check__summary').send_keys('My fact-check summary')
    wait_for_text_change(' ', '#media-fact-check__summary', :css)
    wait_for_selector('#media__claim').click
    sleep 5

    # Make sure claim and fact-check were saved
    @driver.navigate.refresh
    wait_for_selector('#media__fact-check')
    expect(@driver.page_source.include?('My claim description')).to be(true)
    expect(@driver.page_source.include?('My fact-check title')).to be(true)
    expect(@driver.page_source.include?('My fact-check summary')).to be(true)

    # Go to report
    wait_for_selector('.media-fact-check__report-designer').click
    expect(@driver.page_source.include?('Design your report')).to be(true)
    expect(@driver.page_source.include?('My fact-check title')).to be(true)
    expect(@driver.page_source.include?('My fact-check summary')).to be(true)
  end
end
