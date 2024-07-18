shared_examples 'articles' do
  it 'should create and add fact-check to an item and go to the report', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.cluster-card')
    wait_for_selector('#side-navigation__article-toggle').click
    wait_for_selector('.projects-list__fact-checks')
    wait_for_selector('#new-article-menu__open-button').click
    wait_for_selector('#new-article-button__add-explainer')
    wait_for_selector('#new-article-button__add-claim-and-fact-check').click
    fill_field('#article-form__description', 'claim 01')
    fill_field('#article-form__context', 'context')
    fill_field('#article-form__title', 'fact check title')
    fill_field('#article-form__summary', 'fact check sumary')
    wait_for_selector('#article-form__url').click
    wait_for_selector('#article-form__save-button').click
    wait_for_selector_none('#article-form__save-button')
    @driver.navigate.refresh
    wait_for_selector('.article-card')
    wait_for_selector('#side-navigation__tipline-toggle').click
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    add_article_to_item
    expect(@driver.find_elements(:css, '.article-card').size).to eq 1
    # Go to report page
    @driver.navigate.refresh
    wait_for_selector('.article-card')
    wait_for_selector('#media-article-card__edit-button').click
    wait_for_selector('.media-fact-check__report-designer').click
    wait_for_selector('.report-designer__title')
    expect(@driver.page_source.include?('Design your report')).to be(true)
    expect(@driver.page_source.include?('fact check title')).to be(true)
  end

  it 'should create and add explainer to an item', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.cluster-card')
    wait_for_selector('#side-navigation__article-toggle').click
    wait_for_selector('.projects-list__explainers').click
    wait_for_selector('.list-sort')
    wait_for_selector('#new-article-menu__open-button').click
    wait_for_selector('#new-article-button__add-claim-and-fact-check')
    wait_for_selector('#new-article-button__add-explainer').click
    fill_field('#article-form__title', 'explainer title')
    fill_field('#article-form__summary', 'fact check sumary')
    wait_for_selector('#article-form__url').click
    wait_for_selector('#article-form__save-button').click
    wait_for_selector_none('#article-form__save-button')
    @driver.navigate.refresh
    wait_for_selector('.article-card')
    wait_for_selector('#side-navigation__tipline-toggle').click
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    add_article_to_item
    expect(@driver.find_elements(:css, '.article-card').size).to eq 1
  end
end
