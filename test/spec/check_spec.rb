require_relative 'spec_helper.rb'

shared_examples 'custom' do
  it "should register and redirect to newly created media", bin4: true do
    api_create_team_and_project
    page = ProjectPage.new(config: @config, driver: @driver).load
           .create_media(input: @media_url)
    wait_for_selector('.add-annotation__buttons')
    expect(page.contains_string?('Added')).to be(true)
    expect(page.contains_string?('User With Email')).to be(true)
    expect(page.status_label == 'UNSTARTED').to be(true)

    $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)/)[1]
    expect($media_id.nil?).to be(false)
  end

  it "should find medias when searching by status", bin2: true do
    api_create_media_and_go_to_search_page
    wait_for_selector(".medias__item")
    expect(@driver.page_source.include?('to announce')).to be(true)
    wait_for_selector("#search__open-dialog-button").click
    el = wait_for_selector("//div[contains(text(), 'False')]",:xpath)
    el.click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector_none("#search-query__submit-button")
    wait_for_selector_none(".medias__item")
    expect(@driver.page_source.include?('to announce')).to be(false)
    wait_for_selector("#search__open-dialog-button").click
    el = wait_for_selector("//div[contains(text(), 'Unstarted')]",:xpath)
    el.click
    wait_for_selector("#search-query__submit-button").click
    wait_for_selector_none("#search-query__submit-button")
    wait_for_selector(".medias__item")
    wait_for_selector(".media-status__current--undetermined")
    expect(@driver.page_source.include?('to announce')).to be(true)
  end

  it "should register and redirect to newly created image media", bin4: true do
    api_create_team_and_project
    page = ProjectPage.new(config: @config, driver: @driver).load
           .create_image_media(File.expand_path('test.png', File.dirname(__FILE__)))

    wait_for_selector('.media-detail__clickable-header')
    expect(page.contains_string?('Added')).to be(true)
    expect(page.contains_string?('User With Email')).to be(true)
    expect(page.status_label == 'UNSTARTED').to be(true)

    wait_for_selector('.media__annotations-column')
    $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)/)[1]
    expect($media_id.nil?).to be(false)
  end

  it "should set status to media as a command", bin4: true do
    media = api_create_team_project_and_claim
    @driver.navigate.to media.full_url

    wait_for_selector('.annotations__list-item')
    expect(@driver.page_source.include?('Status set')).to be(false)

    # Add a status as a command
    wait_for_selector('#cmd-input')
    fill_field('#cmd-input', '/status In Progress')
    @driver.action.send_keys(:enter).perform

    # Verify that status was added to annotations list
    wait_for_selector('.annotation--verification_status')
    expect(@driver.page_source.include?('Status set')).to be(true)

    # Reload the page and verify that status is still there
    @driver.navigate.refresh
    wait_for_selector('.annotation--verification_status')
    expect(@driver.page_source.include?('Status set')).to be(true)
  end

  it "should change a media status via the dropdown menu", bin3: true do
    media = api_create_team_project_and_claim
    @driver.navigate.to media.full_url
    wait_for_selector("media__notes-heading", :class)
    media_pg = MediaPage.new(config: @config, driver: @driver)
    expect(media_pg.status_label).to eq('UNSTARTED')
    media_pg.change_status(:verified)
    expect(media_pg.status_label).to eq('VERIFIED')
    expect(media_pg.contains_element?('.annotation__status--verified')).to be(true)
  end

  it "should search by status through URL", bin2: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.title =~ /False/).nil?).to be(true)
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"verification_status"%3A%5B"false"%5D%7D'
    wait_for_selector(".search__results-heading")
    expect((@driver.title =~ /False/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector("#search__open-dialog-button").click
    wait_for_selector("#search-form")
    selected = @driver.find_elements(:css, '.search-query__filter-button--selected').map(&:text).sort
    expect(selected == ['False', 'Created', 'Newest first', 'Links', 'Claims', 'Images', 'Videos'].sort).to be(true)
  end
end
