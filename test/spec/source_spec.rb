require_relative 'spec_helper.rb'

shared_examples 'source' do 

  it "should go to source page through user/:id", bin6: true do
    user = api_register_and_login_with_email
    @driver.navigate.to @config['self_url'] + '/check/user/' + user.dbid.to_s
    title = wait_for_selector('.source__name')
    expect(title.text == 'User With Email').to be(true)
  end

  it "should tag source as a command", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
    wait_for_selector('.source__tab-button-account')
    expect(@driver.page_source.include?('command')).to be(false)
    el = wait_for_selector('.source__tab-button-notes')
    el.click
    wait_for_selector('.add-annotation__insert-photo')
    expect(@driver.page_source.include?('Tagged #command')).to be(false)
    input = wait_for_selector('#cmd-input')
    input.send_keys('/tag command')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__author-name')
    wait_for_size_change(0,'.annotations__list-item')
    expect(@driver.page_source.include?('Tagged #command')).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.source__tab-button-account')
    expect(@driver.page_source.include?('command')).to be(true)
  end

  it "should comment source as a command", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('The Beatles', 'https://twitter.com/thebeatles')
    wait_for_selector('.source__tab-button-account')
    el = wait_for_selector('.source__tab-button-notes')
    el.click
    expect(@driver.page_source.include?('This is my comment')).to be(false)
    input = wait_for_selector('#cmd-input')
    input.send_keys('/comment This is my comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__avatar-col')
    wait_for_size_change(0,'annotations__list-item')
    expect(@driver.page_source.include?('This is my comment')).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.source__tab-button-account')
    el = wait_for_selector('.source__tab-button-notes')
    el.click
    wait_for_selector('.annotation__card-content')
    expect(@driver.page_source.include?('This is my comment')).to be(true)
  end

  it "should not create report as source", bin6: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector("#search__open-dialog-button")
    wait_for_selector("#create-media__add-item").click
    wait_for_selector(".create-media__form")
    wait_for_selector("#create-media__source").click
    wait_for_selector("#create-media-source-name-input")
    fill_field('#create-media-source-url-input', 'https://twitter.com/IronMaiden/status/832726327459446784')
    wait_for_text_change(' ',"#create-media-source-url-input", :css)
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector('.create-media__message')
    expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(true)
    message = wait_for_selector('.message').text
    expect(message.match(/Sorry, this is not a profile/).nil?).to be(false)
  end

  it "should edit basic source data (name, description/bio, avatar)", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('ACDC', 'https://twitter.com/acdc')
    el = wait_for_selector(".source-menu__edit-source-button")
    el.click
    input = wait_for_selector('#source__name-container')
    input.send_keys(" - EDIT ACDC")
    input = wait_for_selector('#source__bio-container')
    input.send_keys(" - EDIT DESC")
    el = wait_for_selector(".source__edit-avatar-button")
    el.click
    wait_for_selector(".without-file")
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector(".with-file")
    @driver.find_element(:class, 'source__edit-save-button').click
    wait_for_selector(".source__tab-button-notes")
    displayed_name = wait_for_selector('h1.source__name').text
    expect(displayed_name.include? "EDIT").to be(true)
  end

  it "should add and remove accounts to sources", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
    wait_for_selector(".source__tab-button-account")
    element = wait_for_selector(".source-menu__edit-source-button")
    element.click
    element = wait_for_selector(".source__edit-addinfo-button")
    element.click
    element = wait_for_selector(".source__add-link")
    element.click
    wait_for_selector("#source__link-input0")
    fill_field("#source__link-input0", "www.acdc.com")
    element = wait_for_selector( '.source__edit-save-button')
    element.click
    wait_for_selector('.media-tags')
    expect(@driver.page_source.include?('AC/DC Official Website')).to be(true)

    #networks tab
    element = @driver.find_element(:class, "source__tab-button-account")
    element.click
    wait_for_selector('.source-card')
    expect(@driver.page_source.include?('The Official AC/DC website and store')).to be(true)

    #delete
    element = wait_for_selector(".source-menu__edit-source-button")
    element.click
    wait_for_selector(".source__bio-input")
    list = wait_for_selector_list("svg[class='create-task__remove-option-button create-task__md-icon']")
    element = wait_for_selector_list('.source__remove-link-button')[1]
    element.click
    element = wait_for_selector('.source__edit-save-button')
    element.click
    wait_for_selector('.media-tags')
    expect(@driver.page_source.include?('AC/DC Official Website')).to be(false)
  end

  it "should edit source metadata (contact, phone, location, organization, other)", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
    wait_for_selector('.source__tab-button-account')
    expect(@driver.page_source.include?('label: value')).to be(false)
    expect(@driver.page_source.include?('Location 123')).to be(false)
    expect(@driver.page_source.include?('ORGANIZATION')).to be(false)
    expect(@driver.page_source.include?('989898989')).to be(false)
    el = wait_for_selector('.source-menu__edit-source-button')
    el.click
    el = wait_for_selector('.source__edit-addinfo-button')
    el.click
    el = wait_for_selector('.source__add-phone')
    el.click
    wait_for_selector(".source__metadata-phone-input")
    fill_field('.source__metadata-phone-input input[type="text"]', '989898989')
    el = wait_for_selector('.source__edit-addinfo-button')
    el.click
    el = wait_for_selector(".source__add-organization")
    el.click
    wait_for_selector(".source__metadata-organization-input")
    fill_field('.source__metadata-organization-input input[type="text"]', 'ORGANIZATION')
    el = wait_for_selector(".source__edit-addinfo-button")
    el.click
    el = wait_for_selector(".source__add-location")
    el.click
    wait_for_selector(".source__metadata-location-input")
    fill_field('.source__metadata-location-input input[type="text"]', 'Location 123')
    #source__add-other
    el = wait_for_selector(".source__edit-addinfo-button")
    el.click
    el = wait_for_selector(".source__add-other")
    el.click
    wait_for_selector("#source__other-label-input")
    fill_field("#source__other-label-input", "label")
    fill_field("#source__other-value-input", "value")
    @driver.action.send_keys("\t").perform
    @driver.action.send_keys("\t").perform
    @driver.action.send_keys("\n").perform
    el = wait_for_selector(".source__edit-save-button")
    el.click
    wait_for_selector('.source-menu__edit-source-button')
    expect(@driver.page_source.include?('label: value')).to be(true)
    expect(@driver.page_source.include?('Location 123')).to be(true)
    expect(@driver.page_source.include?('ORGANIZATION')).to be(true)
    expect(@driver.page_source.include?('989898989')).to be(true)

    # Now try to edit
    wait_for_selector('.source-menu__edit-source-button').click
    wait_for_selector("#source__name-container")
    fill_field('.source__metadata-phone-input input[type="text"]', '121212121')
    wait_for_selector('.source__edit-save-button').click
    wait_for_selector('.source-menu__edit-source-button')
    expect(@driver.page_source.include?('121212121')).to be(true)
  end

  it "should add and remove source languages", bin6: true  do
    api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
    wait_for_selector(".source__tab-button-account")
    element = wait_for_selector(".source-menu__edit-source-button")
    element.click
    wait_for_selector(".source__edit-buttons-cancel-save")
    element = wait_for_selector(".source__edit-addinfo-button")
    element.click
    element = wait_for_selector(".source__add-languages")
    element.click
    wait_for_selector("#sourceLanguageInput")
    fill_field("#sourceLanguageInput", "Acoli")
    element = wait_for_selector('div[role="menu"] > div > span[role="menuitem"]');
    element.click
    element = wait_for_selector(".source__edit-save-button")
    element.click
    wait_for_selector(".source-tags__tag")
    expect(@driver.page_source.include?('Acoli')).to be(true)
    element = wait_for_selector(".source-menu__edit-source-button")
    element.click
    elements = wait_for_selector_list("div.source-tags__tag svg")
    elements[0].click
    element = wait_for_selector(".source__edit-save-button")
    element.click
    wait_for_selector(".source__tab-button-media")
    expect(@driver.page_source.include?('Acoli')).to be(false)
  end

  #source section start
  it "should add and remove source tags", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('GOT', 'https://twitter.com/GameOfThrones')
    element =  wait_for_selector(".source-menu__edit-source-button")
    element.click
    element =  wait_for_selector(".source__edit-addinfo-button")
    element.click
    element =  wait_for_selector(".source__add-tags")
    element.click
    wait_for_selector("#sourceTagInput")
    fill_field("#sourceTagInput", "TAG1")
    @driver.action.send_keys("\n").perform
    fill_field("#sourceTagInput", "TAG2")
    @driver.action.send_keys("\n").perform
    element =  wait_for_selector(".source__edit-save-button")
    element.click
    wait_for_selector(".source-menu__edit-source-button")
    expect(@driver.page_source.include?('TAG1')).to be(true)
    expect(@driver.page_source.include?('TAG2')).to be(true)

    #delete
    element = wait_for_selector(".source-menu__edit-source-button")
    element.click
    wait_for_selector(".source__edit-buttons-add-merge")
    list = wait_for_selector_list("div.source-tags__tag svg")
    list[0].click
    element =  wait_for_selector(".source__edit-save-button")
    element.click
    wait_for_selector(".source__tab-button-account")
    list = wait_for_selector_list("div.source-tags__tag")
    expect(list.length == 1).to be(true)
  end

  it "should tag source multiple times with commas with command", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('Motorhead', 'https://twitter.com/mymotorhead')

    wait_for_selector('.source__tab-button-notes').click

    fill_field('#cmd-input', '/tag foo, bar')
    @driver.action.send_keys(:enter).perform

    wait_for_selector_list_size('.annotation--tag', 2)
    expect(@driver.page_source.include?('Tagged #foo')).to be(true)
    expect(@driver.page_source.include?('Tagged #bar')).to be(true)
  end

  it "should delete annotation from annotations list (for media and source)", bin5: true do
    # Source
    api_create_team_project_and_source_and_redirect_to_source('Megadeth', 'https://twitter.com/megadeth')
    wait_for_selector(".source__tab-button-account")
    el = wait_for_selector(".source__tab-button-notes")
    el.click
    wait_for_selector('.add-annotation')
    expect(@driver.page_source.include?('Test note')).to be(false)
    old = wait_for_selector_list('annotation__card-content', :class, 25, 'delete annotation from annotations list 1').length
    fill_field('textarea[name="cmd"]', 'Test note')
    el = wait_for_selector(".add-annotation button[type=submit]")
    el.click
    old = wait_for_size_change(old, 'annotation__card-content', :class, 25, 'delete annotation from annotations list 2')
    expect(@driver.page_source.include?('Test note')).to be(true)
    expect(@driver.page_source.include?('Comment deleted by')).to be(false)
    el = wait_for_selector('.menu-button')
    el.click
    el = wait_for_selector('.annotation__delete')
    el.click
    wait_for_selector_none('.menu-button')
    wait_for_size_change(old, 'annotation__card-content', :class, 25, 'delete annotation from annotations list 3')
    expect(@driver.page_source.include?('Comment deleted by')).to be(true)

    # Media
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.add-annotation')
    expect(@driver.page_source.include?('Test note')).to be(false)
    wait_for_selector(".media__annotations-column > div > div > button + button + button").click
    old = wait_for_selector_list('annotation__card-content', :class, 25, 'delete annotation from annotations list 4').length
    fill_field('textarea[name="cmd"]', 'Test note')
    el = wait_for_selector(".add-annotation button[type=submit]")
    el.click
    old = wait_for_size_change(old, 'annotation__card-content', :class, 25, 'delete annotation from annotations list 5')
    expect(@driver.page_source.include?('Test note')).to be(true)
    expect(@driver.page_source.include?('Comment deleted by')).to be(false)
    el = wait_for_selector('.menu-button')
    el.click
    el = wait_for_selector('.annotation__delete')
    el.click
    wait_for_selector_none('.menu-button')
    wait_for_size_change(old, 'annotation__card-content', :class, 25, 'delete annotation from annotations list 6')
    expect(@driver.page_source.include?('Comment deleted by')).to be(true)
  end

  it "should create source and redirect to newly created source", bin6: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector(".project-actions")
    wait_for_selector("#create-media__add-item").click
    wait_for_selector("#create-media__source").click
    wait_for_selector("#create-media-source-name-input")
    fill_field('#create-media-source-name-input', @source_name)
    fill_field('#create-media-source-url-input', @source_url)
    wait_for_text_change(' ',"#create-media-source-url-input", :css)
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector(".message")
    wait_for_selector_none('#create-media-dialog__dismiss-button')
    wait_for_selector(".source__name")
    expect(@driver.current_url.to_s.match(/\/source\/[0-9]+$/).nil?).to be(false)
    title = wait_for_selector('.source__name').text
    expect(title == @source_name).to be(true)
  end

  it "should not create duplicated source", bin6: true do
    api_create_team_project_and_source_and_redirect_to_source('Megadeth', 'https://twitter.com/megadeth')
    id1 = @driver.current_url.to_s.gsub(/^.*\/source\//, '').to_i
    expect(id1 > 0).to be(true)
    @driver.navigate.to @driver.current_url.to_s.gsub(/\/source\/[0-9]+$/, '')
    wait_for_selector("#create-media__add-item").click
    wait_for_selector("#create-media-submit")
    el = wait_for_selector('#create-media__source')
    el.click
    wait_for_selector('#create-media-quote-input')
    fill_field('#create-media-source-name-input', 'Megadeth')
    fill_field('#create-media-source-url-input', 'https://twitter.com/megadeth')
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector(".source__tab-button-account")
    id2 = @driver.current_url.to_s.gsub(/^.*\/source\//, '').to_i
    expect(id2 > 0).to be(true)
    expect(id1 == id2).to be(true)
  end

  it "should not show source option to be added as a related item" , bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Photo')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote')
    expect(@driver.page_source.include?('Photo')).to be(true)
    expect(@driver.find_element(:id, "create-media__source").nil?).to be(true)
  end
end