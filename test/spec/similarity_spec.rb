shared_examples 'similarity' do
  it 'should import, export, list, pin and remove similarity items', bin5: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page({ count: 3 })
    sleep 60 # wait for the items to be indexed in the Elasticsearch
    wait_for_selector('.search__results-heading')
    project_url = @driver.current_url.to_s
    create_folder_or_collection('list', '.projects-list__add-folder')
    wait_for_selector('.project-list__header')
    @driver.navigate.to project_url
    wait_for_selector('.search__results-heading')
    wait_for_selector('.media__heading').click
    wait_for_selector('#media__claim')
    wait_for_selector('#media-similarity__add-button').click
    # import similarity item
    wait_for_selector('#import-fact-check__button').click
    add_related_item('Claim 0')
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
    expect(@driver.page_source.include?('Media')).to be(true)
    @driver.navigate.to project_url
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
    # pin similar item
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__delete-relationship')
    wait_for_selector('.similarity-media-item__pin-relationship').click
    wait_for_url_change(@driver.current_url.to_s)
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 2
    # remove similar item
    wait_for_selector('.media-similarity__menu-icon').click
    wait_for_selector('.similarity-media-item__pin-relationship')
    wait_for_selector('.similarity-media-item__delete-relationship').click
    wait_for_selector('.media-item__add-button')
    wait_for_selector('input[name=project-title]').click
    wait_for_selector('input[name=project-title]').send_keys('list')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-item__add-button').click
    wait_for_selector('.message')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
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
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath).click
    wait_for_selector("//span[contains(text(), '2 suggestion')]", :xpath)
    wait_for_selector('.similarity-media-item__accept-relationship').click
    wait_for_selector("//span[contains(text(), '1 suggestion')]", :xpath)
    wait_for_selector('.similarity-media-item__reject-relationship').click
    wait_for_selector('.media-actions-bar__add-button').click
    wait_for_selector('#media-similarity__add-button')
    wait_for_selector("//span[contains(text(), 'Media')]", :xpath).click
    wait_for_selector('.media__relationship')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
    expect(@driver.page_source.include?('claim 1')).to be(true)
  end

  it 'should suggest different texts as similar', bin7: true do
    create_team_and_install_bot(bot: '.team-bots__alegre-uninstalled')
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    create_media('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.')
    create_media('Lorem Ipsum is used to generate dummy texts of the printing and TI industry. Lorem Ipsum has been used by the industry for text generation ever since the 1500s.')
    wait_for_selector('.medias__item')
    sleep 120 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Media')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath).click
    wait_for_selector('.similarity-media-item__accept-relationship')
    expect(@driver.page_source.include?('1 suggestion')).to be(true)
  end

  it 'should identify images as similar', bin8: true do
    create_team_and_install_bot(bot: '.team-bots__alegre-uninstalled')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    create_image('files/similarity.jpg')
    sleep 120
    create_image('files/similarity2.jpg')
    wait_for_selector('.medias__item')
    sleep 120 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Media')]", :xpath).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify videos as similar', bin8: true do
    create_team_and_install_bot(bot: '.team-bots__alegre-uninstalled')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    create_image('files/video.mp4')
    sleep 120
    create_image('files/video2.mp4')
    wait_for_selector('.medias__item')
    sleep 120 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Media')]", :xpath).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should identify audios in different formats as similar', bin9: true do
    create_team_and_install_bot(bot: '.team-bots__alegre-uninstalled')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media__add-item')
    create_image('files/audio.mp3')
    sleep 120
    wait_for_selector('.medias__item', :css, 60, true)
    create_image('files/audio.ogg')
    wait_for_selector('.medias__item')
    sleep 120 # wait for the items to be indexed in the Elasticsearch and to be identified as similar
    wait_for_selector_list_size('.media__heading', 2)
    wait_for_selector('.media__heading', index: 1).click
    wait_for_selector('#media__claim')
    wait_for_selector("//span[contains(text(), 'Suggestions')]", :xpath)
    wait_for_selector("//span[contains(text(), 'Media')]", :xpath).click
    wait_for_selector('.media__more-medias')
    expect(@driver.find_elements(:css, '.media__relationship').size).to eq 1
  end

  it 'should extract text from a image', bin7: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#create-media__add-item')
    create_image('files/test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    expect(@driver.page_source.include?('Extracted text')).to be(false)
    expect(@driver.page_source.include?('RAILS')).to be(false)
    wait_for_selector('#media-expanded-actions__menu').click
    wait_for_selector('#media-expanded-actions__reverse-image-search')
    wait_for_selector('#ocr-button__extract-text').click
    sleep 60 # wait for the text extraction
    @driver.navigate.refresh
    wait_for_selector('.image-media-card')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    expect(@driver.page_source.include?('Extracted text')).to be(true)
    expect(@driver.page_source.include?('RAILS')).to be(true)
  end
end
