shared_examples 'similarity' do
  it 'should import and export items', bin4: true do
    api_create_team_claims_sources_and_redirect_to_all_items({ count: 3 })
    sleep 90 # wait for the items to be indexed in the Elasticsearch
    wait_for_selector('.search__results-heading')
    all_items_url = @driver.current_url.to_s
    wait_for_selector('.media__heading').click
    wait_for_selector('#media__claim')
    wait_for_selector('#media-similarity__add-button').click
    # import similarity item
    wait_for_selector('#import-fact-check__button').click
    add_related_item('Claim 0')
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
    expect(@driver.page_source.include?('Media')).to be(true)
    @driver.navigate.to all_items_url
    wait_for_selector('.search__results-heading')
    wait_for_selector_list('.media__heading').last.click
    wait_for_selector('#media__claim')
    # export similarity item
    wait_for_selector('#media-similarity__add-button').click
    wait_for_selector('#export-fact-check__button').click
    add_related_item('Claim 2')
    @driver.navigate.refresh
    wait_for_selector('.media-similarity__menu-icon')
    expect(@driver.page_source.include?('Media')).to be(true)
    # list similar items
    wait_for_selector('.media__relationship')
    wait_for_selector_none('.media-tab__metadata"')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 2
    expect(@driver.page_source.include?('Media')).to be(true)
  end

  it 'should pin and remove similarity items', bin4: true do
    data = api_create_team_and_bot
    pm1 = api_create_claim(data: data, quote: 'claim 1')
    pm2 = api_create_claim(data: data, quote: 'claim 2')
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm2.id)
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}"
    wait_for_selector('#media-similarity__add-button')
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath).click
    wait_for_selector('.similarity-media-item__accept-relationship').click
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
    # pin similar item
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__delete-relationship')
    wait_for_selector('.similarity-media-item__pin-relationship').click
    wait_for_url_change(@driver.current_url.to_s)
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
    # remove similar item
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__pin-relationship')
    wait_for_selector('.similarity-media-item__delete-relationship').click
    wait_for_selector('.message')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 0
  end

  it 'should accept and reject suggested similarity', bin1: true do
    data = api_create_team_and_bot
    pm1 = api_create_claim(data: data, quote: 'claim 1')
    pm2 = api_create_claim(data: data, quote: 'claim 2')
    pm3 = api_create_claim(data: data, quote: 'claim 3')
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm2.id)
    api_suggest_similarity_between_items(data[:team].dbid, pm1.id, pm3.id)
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}"
    wait_for_selector('#media-similarity__add-button')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 0
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath).click
    wait_for_selector('.similarity-media-item__accept-relationship').click
    wait_for_selector('.media__relationship')
    wait_for_selector('.similarity-media-item__reject-relationship').click
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should extract text from a image', bin7: true do
    api_create_team_and_bot(bot: 'alegre', score: {})
    @driver.navigate.to @config['self_url']
    verbose_wait 5
    wait_for_selector('.team-settings__workspace-tab')
    wait_for_selector('#side-navigation__toggle').click
    wait_for_selector('.projects-list')
    wait_for_selector('.projects-list__all-items').click
    create_image('files/ocr.png')
    verbose_wait 5
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    verbose_wait 5
    expect(@driver.page_source.include?('Extracted text')).to be(true)
    expect(@driver.page_source.include?('Test')).to be(true)
  end

  it 'should identify texts as similar', bin7: true do
    data = api_create_team_and_bot(bot: 'alegre', score: { min_es_score: 0 })
    pm1 = api_create_claim(data: data, quote: 'Lorem Ipsum is used to generate dummy texts of the printing and TI industry. Lorem Ipsum has been used by the industry for text generation ever since the 1502s.')
    sleep 60 # wait for the items to be indexed in the Elasticsearch
    api_create_claim(data: data, quote: 'Lorem Ipsum is used to generate dummy texts of the printing and TI industry. Lorem Ipsum has been used by the industry for text generation ever since the 1501s.')
    sleep 60 # wait for the items to be indexed in the Elasticsearch
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm1.id}"
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify images as similar', bin7: true do
    api_create_team_and_bot(bot: 'alegre')
    @driver.navigate.to @config['self_url']
    create_image('files/similarity.jpg')
    sleep 60 # Wait for the item to be indexed by Alegre
    wait_for_selector('.medias__item')
    create_image('files/similarity2.jpg')
    wait_for_selector('.medias__item')
    sleep 60 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify videos as similar', bin7: true do
    api_create_team_and_bot(bot: 'alegre')
    @driver.navigate.to @config['self_url']
    create_image('files/video.mp4')
    sleep 60 # Wait for the item to be indexed by Alegre
    wait_for_selector('.medias__item')
    create_image('files/video2.mp4')
    wait_for_selector('.medias__item')
    sleep 60 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify audios as similar', bin7: true do
    api_create_team_and_bot(bot: 'alegre')
    @driver.navigate.to @config['self_url']
    create_image('files/audio.mp3')
    sleep 200 # Wait for the item to be indexed by Alegre
    wait_for_selector('.medias__item')
    create_image('files/audio.ogg')
    sleep 250 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end
end
