shared_examples 'secondary items' do

  it "should promote related item to main item" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Main Item')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Main Item')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Main Item')).to be(true)
    wait_for_selector(".media-condensed__actions_icon").click
    wait_for_selector('.media-condensed__promote-relationshp').click
    wait_for_selector_none(".media-condensed__break-relationshp")
    wait_for_selector(".project-header__back-button").click
    @driver.navigate.refresh
    wait_for_selector("#create-media__add-item")
    wait_for_selector(".media__heading")
    expect(@driver.page_source.include?('Main Item')).to be(true)
    expect(@driver.page_source.include?('Claim')).to be(false)
  end

  it "should create a related image, delete the main item and verify that the both items were deleted" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    #add a related image
    wait_for_selector('.create-related-media__add-button').click
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__image').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector('#create-media-dialog__submit-button').click
    #verify that the image was created
    wait_for_selector(".media-related__secondary-item")
    cards = wait_for_selector_list(".card").length
    expect(cards == 2).to be(true)
    wait_for_selector('.media-actions__icon').click
    #delete the main item
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector(".message").click
    wait_for_selector_none(".message")
    wait_for_selector('.project-header__back-button').click
    @driver.navigate.refresh
    wait_for_selector('#create-media__add-item')
    #verify that both items were deleted
    wait_for_selector_list_size(".medias__item", 0)
    expect(@driver.page_source.include?('Add a link or text')).to be(true)
  end

  it "should break relationship between related items" , bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    #add a related link
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__link').click
    wait_for_selector("#create-media-input")
    fill_field('#create-media-input', 'https://twitter.com/meedan/status/1167366036791943168')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    #verify that the link was created
    wait_for_selector_list_size(".media-detail", 2)
    cards = wait_for_selector_list(".media-detail").length
    expect(cards == 2).to be(true)
    #break the relationship between the items
    wait_for_selector(".media-condensed__actions_icon").click
    wait_for_selector('.media-condensed__break-relationship').click
    wait_for_selector_none('.media-condensed__break-relationship')
    wait_for_selector_list_size(".media-detail", 1)
    expect(wait_for_selector_list(".media-detail").length == 1).to be(true)
  end

  it "should install Smooch bot, create a claim, change the status and add a related item", bin1: true do
    response = api_create_team_and_project
    bot_name = 'Smooch'
    install_bot(response[:team].slug, bot_name)
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector(".home--team")
    wait_for_selector(".team-members__member")
    @driver.navigate.refresh
    wait_for_selector(".team-members__member")
    wait_for_selector("//div[contains(text(), 'Smooch')]", :xpath)
    wait_for_selector(".team__project").click
    wait_for_selector("#search__open-dialog-button")
    create_media("Claim", false)
    sleep 10 # Wait for ElasticSearch
    @driver.navigate.refresh
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading a").click
    wait_for_selector(".create-related-media__add-button")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to(".media-status__menu-item--in-progress", true)
    wait_for_selector(".media-status__current--in-progress")
    expect(@driver.page_source.include?('Claim Related')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Claim Related')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    wait_for_selector(".medias__item").click
    wait_for_selector(".media-status__current--in-progress")
  end
  
  it "should go back to primary item", bin1: true do
    # Go to primary item
    api_create_team_project_and_claim_and_redirect_to_media_page
    expect((@driver.title =~ /Claim/).nil?).to be(false)
    expect((@driver.title =~ /Secondary/).nil?).to be(true)

    # Create related item
    wait_for_selector('.media-detail')
    wait_for_selector('.create-related-media__add-button')
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__quote').click
    wait_for_selector('#create-media-quote-input')
    fill_field('#create-media-quote-input', 'Secondary Item')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none('#create-media-quote-input')

    # Go to related item
    wait_for_selector('.media-condensed__title').click
    wait_for_selector('#media-related__primary-item')
    expect((@driver.title =~ /Claim/).nil?).to be(true)
    expect((@driver.title =~ /Secondary/).nil?).to be(false)

    # Go back to primary item
    wait_for_selector('.media-condensed__title').click
    wait_for_selector('.media-related__secondary-item')
    expect((@driver.title =~ /Claim/).nil?).to be(false)
    expect((@driver.title =~ /Secondary/).nil?).to be(true)
  end
end