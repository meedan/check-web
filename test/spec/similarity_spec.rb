shared_examples 'similarity' do
  it 'should import, export, list, pin and remove similarity items', bin5: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page 3, 0
    wait_for_selector('.search__results-heading')
    project_url = @driver.current_url.to_s
    create_folder_or_collection('list', '.projects-list__add-folder')
    wait_for_selector('.project-list__header')
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-analysis__copy-to-report')
    wait_for_selector("//span[contains(text(), 'Add similar')]", :xpath).click
    # import similarity item
    wait_for_selector("//span[contains(text(), 'Import similar media into this item')]", :xpath).click
    add_related_item('Claim 0')
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('Similar')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector_list('.media__heading').last.click
    wait_for_selector('.media-analysis__copy-to-report')
    # export similarity item
    wait_for_selector("//span[contains(text(), 'Add similar')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Export all media to another item')]", :xpath).click
    add_related_item('Claim 2')
    wait_for_selector_list_size('.MuiCardHeader-title', 3)
    expect(@driver.page_source.include?('Similar')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    # list similar items
    wait_for_selector("//span[contains(text(), '2 similar media')]", :xpath).click
    wait_for_selector_none('.media-tab__metadata"')
    wait_for_selector_list_size('.MuiCardHeader-title', 3)
    expect(@driver.page_source.include?('Similar')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    # pin similar item
    expect(wait_for_selector('.MuiCardHeader-title').text == 'Claim 2').to be(true)
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector("//span[contains(text(), 'Pin as main')]", :xpath).click
    wait_for_selector('.message')
    wait_for_selector("//span[contains(text(), 'Click on an item')]", :xpath)
    expect(wait_for_selector('.MuiCardHeader-title').text == 'Claim 0').to be(true)
    # remove similar item
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector("//span[contains(text(), 'Detach')]", :xpath).click
    wait_for_selector('input[name=project-title]').send_keys('list')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-item__add-button').click
    wait_for_selector('.message')
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
  end

  it 'should add and remove related items', bin6: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page 2, 0
    wait_for_selector('.search__results-heading')
    wait_for_selector_list_size('.media__heading', 2)
    project_url = @driver.current_url.to_s
    create_folder_or_collection('list', '.projects-list__add-folder')
    wait_for_selector('.project-list__header')
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-analysis__copy-to-report')
    expect(@driver.page_source.include?('Claim 0')).to be(false)
    @driver.execute_script('window.scrollTo(0, 50)')
    wait_for_selector('.media-tab__related').click
    wait_for_selector("//span[contains(text(), '0 related items')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Add relation')]", :xpath).click
    add_related_item('Claim 0')
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    wait_for_selector('.related-media-item__delete-relationship').click
    wait_for_selector('input[name=project-title]').send_keys('list')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-item__add-button').click
    wait_for_selector_list_size('.MuiCardHeader-title', 1)
    expect(@driver.page_source.include?('Claim 0')).to be(false)
  end

  it 'should accept and reject suggested similarity', bin5: true do
    data = api_create_team_and_project
    pm1 = api_create_claim(data: data, quote: 'claim 1')
    pm2 = api_create_claim(data: data, quote: 'claim 2')
    pm3 = api_create_claim(data: data, quote: 'claim 3')
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm2.id)
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm3.id)
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-analysis__copy-to-report')
    expect(@driver.page_source.include?('claim 2')).to be(false)
    wait_for_selector("//span[contains(text(), 'Suggested media')]", :xpath).click
    wait_for_selector("//span[contains(text(), '1 of 2 suggested media')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Is the suggested media similar to the main?')]", :xpath)
    wait_for_selector('#similarity-media-item__accept-relationship').click
    wait_for_selector("//span[contains(text(), '1 of 1 suggested media')]", :xpath)
    wait_for_selector('#similarity-media-item__reject-relationship').click
    wait_for_selector('.media-page__back-button').click
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath).click
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('claim 1')).to be(true)
    expect(@driver.page_source.include?('claim 2')).to be(true)
    expect(@driver.page_source.include?('claim 3')).to be(false)
  end

  it 'should extract text from a image', bin2: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('.project__description')
    create_image('test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    expect(@driver.page_source.include?('Text extracted from image')).to be(false)
    expect(@driver.page_source.include?('RAILS')).to be(false)
    wait_for_selector("//span[contains(text(), 'Extract text from image')]", :xpath).click
    wait_for_selector_none("//span[contains(text(), 'Extract text from image')]", :xpath)
    expect(@driver.page_source.include?('Text extracted from image')).to be(true)
    expect(@driver.page_source.include?('RAILS')).to be(true)
  end
end
