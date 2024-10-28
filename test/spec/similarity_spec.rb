shared_examples 'similarity' do
  it 'should import and export items', bin4: true do
    api_create_team_claims_sources_and_redirect_to_all_items({ count: 3 })
    verbose_wait 2 # Wait for the items to be indexed in ElasticSearch
    wait_for_selector('.search__results-heading')
    wait_for_selector('.cluster-card').click
    wait_for_selector('#media-similarity__add-button').click

    # Merge similar items
    add_related_item('Claim 0')
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
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
    @driver.action.move_to(wait_for_selector('.suggested-media__item')).perform # hover element
    wait_for_selector('.similarity-media-item__accept-relationship').click
    @driver.navigate.refresh
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
    wait_for_selector('.int-flash-message__toast')
    @driver.navigate.refresh
    wait_for_selector('.test__media')
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
    @driver.action.move_to(wait_for_selector('.suggested-media__item')).perform # hover element
    wait_for_selector('.similarity-media-item__accept-relationship').click
    @driver.action.move_to(wait_for_selector_list('.suggested-media__item')[1]).perform # hover element
    wait_for_selector_list('.similarity-media-item__reject-relationship')[1].click
    @driver.navigate.refresh
    wait_for_selector('#media-similarity__add-button')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify texts as similar', bin7: true do
    data = api_create_team_and_bot(bot: 'alegre', score: { min_es_score: 0 })
    pm = api_create_claim(data: data, quote: 'Lorem Ipsum is used to generate dummy texts of the printing and IT industry.')
    verbose_wait 3
    api_create_claim(data: data, quote: 'Lorem Ipsum is used to generate dummy texts of the printing and IT industry!')
    verbose_wait 3
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm.id}"
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify texts as similar with vector search', bin7: true do
    data = api_create_team_and_bot(bot: 'alegre', score: { 'master_similarity_enabled' => true, 'text_similarity_enabled' => true, 'text_elasticsearch_matching_threshold' => 0.9, 'text_elasticsearch_suggestion_threshold' => 0.7, 'text_vector_matching_threshold' => 0.95, 'text_vector_suggestion_threshold' => 0.75, 'text_similarity_model' => ['elasticsearch', 'xlm-r-bert-base-nli-stsb-mean-tokens'], 'alegre_model_in_use' => ['elasticsearch', 'xlm-r-bert-base-nli-stsb-mean-tokens'], 'min_es_score' => 100_000 })
    pm = api_create_claim(data: data, quote: 'In January 2003, Batista joined Triple H, Ric Flair and Randy Orton to form the heel stable Evolution.[25] Batista, however, was sidelined for much of 2003 after he tore his right triceps muscle at a Raw live event in a tag team match alongside Orton against The Dudley Boyz.')
    verbose_wait 3
    api_create_claim(data: data, quote: 'In January 2003, Batista joined Triple H, Ric Flair and Randy Orton to form the heel stable Evolution.[25] Batista, however, was sidelined for much of 2003 after he tore his right triceps muscle at a Raw live event in a tag team match alongside Orton against The Dudley Boy.')
    verbose_wait 3
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm.id}"
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should prepare environment for media similarity tests', bin8: true do
    data = api_create_team_and_bot(bot: 'alegre', score: { min_es_score: 0 })
    pm = api_create_claim(data: data, quote: 'Just kicking off Alegre service.')
    sleep 60 # Wait for the item to be sent to Alegre
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/media/#{pm.id}"
    wait_for_selector('.quote-media-card')
    expect(@driver.find_elements(:css, '.quote-media-card').size).to eq 1
  end

  it 'should identify images as similar', bin8: true do
    api_create_team_and_bot(bot: 'alegre')
    create_image('files/similarity.jpg')
    verbose_wait 4
    wait_for_selector('.cluster-card')
    create_image('files/similarity2.jpg')
    verbose_wait 4
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should extract text from a image', bin8: true do
    api_create_team_and_bot(bot: 'alegre')
    @driver.navigate.to "#{@config['self_url']}/#{@slug}/settings/workspace"
    create_image('files/ocr.png')
    verbose_wait 4
    wait_for_selector('.cluster-card').click
    wait_for_selector('.image-media-card')
    expect(@driver.page_source.include?('Extracted text')).to be(true)
    expect(@driver.page_source.include?('Test')).to be(true)
  end

  it 'should identify audios as similar', bin8: true do
    api_create_team_and_bot(bot: 'alegre')
    @driver.navigate.to "#{@config['self_url']}/#{@slug}/settings/workspace"
    create_image('files/audio.mp3')
    verbose_wait 4
    wait_for_selector('.cluster-card')
    create_image('files/audio.ogg')
    verbose_wait 4
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify videos as similar', bin8: true do
    api_create_team_and_bot(bot: 'alegre')
    create_image('files/video.mp4')
    verbose_wait 6
    wait_for_selector('.cluster-card')
    create_image('files/video2.mp4')
    verbose_wait 6
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end
end
