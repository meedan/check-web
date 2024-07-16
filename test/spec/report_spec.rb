shared_examples 'report' do
  # it 'should set claim and fact check information for an item, and go to the report', bin2: true do
  #   api_create_team_and_claim_and_redirect_to_media_page
  #   api_install_bot 'smooch'
  #   wait_for_selector('.media-card-large')

  #   # # Claim
  #   # expect(@driver.page_source.include?('My claim description')).to be(false)
  #   # wait_for_selector('#media-fact-check__title')
  #   # wait_for_selector('#media-claim__description').send_keys('My claim description')
  #   # wait_for_text_change(' ', '#media-claim__description', :css)
  #   # wait_for_selector('#media__fact-check').click

  #   # Fact-check
  #   expect(@driver.page_source.include?('My fact-check title')).to be(false)
  #   expect(@driver.page_source.include?('My fact-check summary')).to be(false)
  #   wait_for_selector('#media-fact-check__title').send_keys('My fact-check title')
  #   wait_for_selector('#media-fact-check__summary').click
  #   wait_for_selector('#media-fact-check__summary').send_keys('My fact-check summary')
  #   wait_for_text_change(' ', '#media-fact-check__summary', :css)
  #   wait_for_selector('#media__claim').click
  #   sleep 5

  #   # Make sure claim and fact-check were saved
  #   @driver.navigate.refresh
  #   wait_for_selector('#media__fact-check')
  #   expect(@driver.page_source.include?('My claim description')).to be(true)
  #   expect(@driver.page_source.include?('My fact-check title')).to be(true)
  #   expect(@driver.page_source.include?('My fact-check summary')).to be(true)

  #   # Go to report
  #   wait_for_selector('.media-fact-check__report-designer').click
  #   wait_for_selector('.report-designer__title')
  #   expect(@driver.page_source.include?('Design your report')).to be(true)
  #   expect(@driver.page_source.include?('My fact-check title')).to be(true)
  #   expect(@driver.page_source.include?('My fact-check summary')).to be(true)
  # end


  it 'should create and add fact-check to an item', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.cluster-card')
    wait_for_selector('#side-navigation__article-toggle').click
    wait_for_selector('.projects-list__fact-checks')
    wait_for_selector('#new-article-menu__open-button').click
    wait_for_selector('#new-article-button__add-explainer')
    wait_for_selector('#new-article-button__add-claim-and-fact-check').click
    fill_field('#article-form__description', "claim 01")
    fill_field('#article-form__context', 'context')
    fill_field('#article-form__title', "fact check title")
    fill_field('#article-form__summary', "fact check sumary")
    wait_for_selector('#article-form__url').click
    wait_for_selector('#article-form__save-button').click
    wait_for_selector_none('#article-form__save-button')
    @driver.navigate.refresh
    wait_for_selector('.article-card')
    wait_for_selector('#side-navigation__tipline-toggle').click
    wait_for_selector('.cluster-card')
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media-card-large')
    wait_for_selector('#articles-sidebar-team-articles')
    wait_for_selector('.media-articles-card__card').click
    wait_for_selector('.article-card')
    expect(@driver.find_elements(:css, '.article-card').size).to eq 1
  end

  it 'should create and add explainer to an item', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.cluster-card')
    wait_for_selector('#side-navigation__article-toggle').click
    wait_for_selector('.projects-list__fact-checks')
    wait_for_selector('#new-article-menu__open-button').click
    wait_for_selector('#new-article-button__add-claim-and-fact-check')
    wait_for_selector('#new-article-button__add-explainer').click
    fill_field('#article-form__title', "explainer title")
    fill_field('#article-form__summary', "fact check sumary")
    # wait_for_selector('#article-form__url').click
    sleep 30
  end

end
