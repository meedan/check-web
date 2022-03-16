shared_examples 'similarity' do
  it 'should add and remove related items', bin6: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page({ count: 2 })
    sleep 30 # wait for the items to be indexed in the Elasticsearch
    wait_for_selector('.search__results-heading')
    wait_for_selector_list_size('.media__heading', 2)
    project_url = @driver.current_url.to_s
    create_folder_or_collection('list', '.projects-list__add-folder')
    wait_for_selector('.project-list__header')
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('#media__sidebar')
    expect(@driver.page_source.include?('Claim 0')).to be(false)
    @driver.execute_script('window.scrollTo(0, 50)')
    wait_for_selector('.media-tab__related').click
    wait_for_selector("//span[contains(text(), '0 related items')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Add relation')]", :xpath).click
    # add related item
    add_related_item('Claim 0')
    @driver.navigate.refresh
    wait_for_selector('.media')
    wait_for_selector('.media-tab__related').click
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    wait_for_selector('.related-media-item__delete-relationship').click
    wait_for_selector('input[name=project-title]').click
    wait_for_selector('input[name=project-title]').send_keys('list')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-item__add-button').click
    wait_for_selector_list_size('.MuiCardHeader-title', 1)
    expect(@driver.page_source.include?('Claim 0')).to be(false)
  end

  it 'should import, export, list, pin and remove similarity items', bin5: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page({ count: 3 })
    sleep 15 # wait for the items to be indexed in the Elasticsearch
    wait_for_selector('.search__results-heading')
    project_url = @driver.current_url.to_s
    create_folder_or_collection('list', '.projects-list__add-folder')
    wait_for_selector('.project-list__header')
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Add similar')]", :xpath).click
    # import similarity item
    wait_for_selector("//span[contains(text(), 'Import similar media into this item')]", :xpath).click
    add_related_item('Claim 0')
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('More media')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector_list('.media__heading').last.click
    wait_for_selector('#media__claim')
    # export similarity item
    wait_for_selector("//span[contains(text(), 'Add similar')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Export all media to another item')]", :xpath).click
    add_related_item('Claim 2')
    @driver.navigate.refresh
    wait_for_selector('.media-similarity__menu-icon')
    wait_for_selector_list_size('.MuiCardHeader-title', 3)
    expect(@driver.page_source.include?('More media')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    # list similar items
    wait_for_selector("//span[contains(text(), '3 medias')]", :xpath).click
    wait_for_selector_none('.media-tab__metadata"')
    wait_for_selector_list_size('.MuiCardHeader-title', 3)
    expect(@driver.page_source.include?('More media')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    # pin similar item
    expect(wait_for_selector('.MuiCardHeader-title').text == 'Claim 2').to be(true)
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__delete-relationship')
    wait_for_selector('.similarity-media-item__pin-relationship').click
    wait_for_selector('.message')
    wait_for_url_change(@driver.current_url.to_s)
    wait_for_selector_list_size('.MuiCardHeader-title', 3)
    expect(wait_for_selector('.MuiCardHeader-title').text == 'Claim 0').to be(true)
    # remove similar item
    expect(@driver.find_elements(:css, '.MuiCardHeader-title').size).to eq 3
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__pin-relationship')
    wait_for_selector('.similarity-media-item__delete-relationship').click
    wait_for_selector('.media-item__add-button')
    wait_for_selector('input[name=project-title]').click
    wait_for_selector('input[name=project-title]').send_keys('list')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-item__add-button').click
    wait_for_selector('.message')
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.find_elements(:css, '.MuiCardHeader-title').size).to eq 2
  end

  it 'should accept and reject suggested similarity', bin5: true do
    data = api_create_team_and_project
    pm1 = api_create_claim(data: data, quote: 'claim 1')
    pm2 = api_create_claim(data: data, quote: 'claim 2')
    pm3 = api_create_claim(data: data, quote: 'claim 3')
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm2.id)
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm3.id)
    wait_for_selector('#create-media__add-item')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('.medias__item')
    wait_for_selector_list_size('.media__heading', 3)
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/project/#{data[:project].dbid}/media/#{pm1.id}"
    wait_for_selector('#media-similarity__add-button')
    expect(@driver.page_source.include?('claim 2')).to be(false)
    wait_for_selector("//span[contains(text(), 'Suggested media')]", :xpath).click
    wait_for_selector("//span[contains(text(), '1 of 2 suggested media')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Is this media a good match for')]", :xpath)
    wait_for_selector('#similarity-media-item__accept-relationship').click
    wait_for_selector("//span[contains(text(), '1 of 1 suggested media')]", :xpath)
    wait_for_selector('#similarity-media-item__reject-relationship').click
    wait_for_selector('.media-actions-bar__add-button').click
    wait_for_selector('.media-page__back-button').click
    wait_for_selector('#media-similarity__add-button')
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath).click
    wait_for_selector_list_size('.MuiCardHeader-title', 2)
    expect(@driver.page_source.include?('claim 1')).to be(true)
    expect(@driver.page_source.include?('claim 2')).to be(true)
    expect(@driver.page_source.include?('claim 3')).to be(false)
  end

  it 'should identify texts as similar', bin7: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector('.team-bots__alegre-uninstalled').click
    wait_for_selector('.team-settings__similarity-tab')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('.project__description')
    create_media('This is a text test similarity')
    create_media('This another text test similarity')
    sleep 30 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector('#create-media__add-item')
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.search-show-similar__switch').click
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading svg')
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Suggested media')]", :xpath).click
    wait_for_selector('#similarity-media-item__accept-relationship')
    expect(@driver.page_source.include?('Is this media a good match for the claim')).to be(true)
    expect(@driver.page_source.include?('1 of 1 suggested media')).to be(true)
  end

  it 'should identify image as similar', bin7: true do
    team = "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector('.team-bots__alegre-uninstalled').click
    wait_for_selector('.team-settings__similarity-tab')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('.project__description')
    create_image('files/similarity.jpg')
    create_image('files/similarity2.jpg')
    wait_for_selector('.medias__item')
    sleep 30 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector('#create-media__add-item')
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.search-show-similar__switch').click
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading svg')
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Suggested media')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath).click
    wait_for_selector('.media__more-medias')
    expect(@driver.page_source.include?('More medias')).to be(true)
    expect(@driver.page_source.include?('2 medias')).to be(true)
  end

  it 'should extract text from a image', bin7: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('.project__description')
    create_image('files/test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    expect(@driver.page_source.include?('Text extracted from image')).to be(false)
    expect(@driver.page_source.include?('RAILS')).to be(false)
    wait_for_selector('#media-expanded-actions__menu').click
    wait_for_selector('#media-expanded-actions__reverse-image-search')
    wait_for_selector('#ocr-button__extract-text').click
    sleep 60 # wait for the text extraction
    @driver.navigate.refresh
    wait_for_selector('.image-media-card')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    expect(@driver.page_source.include?('Text extracted from image')).to be(true)
    expect(@driver.page_source.include?('RAILS')).to be(true)
  end
end
