require_relative 'spec_helper.rb'

shared_examples 'media' do |type|
  before :each do
    @type = type
  end

  def create_media_depending_on_type(url = nil, n = 1)
    case @type
    when 'BELONGS_TO_ONE_PROJECT'
      if n == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page : api_create_team_project_and_link_and_redirect_to_media_page(url)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(n)
      end
    when 'DOES_NOT_BELONG_TO_ANY_PROJECT'
      if n == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page("Orphan #{Time.now.to_f}", nil) : api_create_team_project_and_link_and_redirect_to_media_page(url, nil)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(n, nil)
      end
    end
  end

  it "should go from one item to another", bin2: true do
    create_media_depending_on_type(nil, 3)
    wait_for_selector(".projects__list")
    wait_for_selector(".medias__item")
    wait_for_selector('.media__heading a').click
    wait_for_selector('.media-search__actions-bar')
    wait_for_selector(".create-related-media__add-button")

    # First item
    expect(@driver.page_source.include?('1 of 3')).to be(true)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Second item
    wait_for_selector('.media-search__next-item').click
    wait_for_selector('.media-search__actions-bar')
    wait_for_selector(".create-related-media__add-button")
    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(true)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Third item
    wait_for_selector('.media-search__next-item').click
    wait_for_selector('.media-search__actions-bar')
    wait_for_selector(".create-related-media__add-button")

    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(true)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
  end

  it "should autorefresh page when media is created", bin1: true do
    create_media_depending_on_type
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    url = @driver.current_url
    wait_for_selector('#search__open-dialog-button')
    wait_for_selector_list_size(".medias__item", 1)
    expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
    current_window = @driver.window_handles.last
    @driver.execute_script("window.open('#{url}')")
    wait_for_selector("#search-input")
    @driver.switch_to.window(@driver.window_handles.last)
    wait_for_selector('.avatar')
    create_media('Auto-Refresh')
    wait_for_selector('.medias__item')
    @driver.execute_script('window.close()')
    @driver.switch_to.window(current_window)
    wait_for_selector_list_size(".medias__item", 2, :css , 30)
    @wait.until { (@driver.page_source.include?('Auto-Refresh')) }
    expect(@driver.find_elements(:css, '.media__heading').size == 2).to be(true)
    expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
  end

  it "should update notes count after delete annotation", bin3: true do
    create_media_depending_on_type
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".annotations__list")
    fill_field('#cmd-input', 'Comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__avatar-col')
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__history").click
    expect(@driver.find_elements(:class, "annotation__timestamp").length == 1).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector("#item-history__close-button").click
    wait_for_selector(".media-tab__comments").click
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__history").click
    notes_count = wait_for_selector_list('.annotation__timestamp').length
    expect(notes_count > 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it "should restore item from trash from item page", bin2: true do
    create_media_depending_on_type
    wait_for_selector(".media")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector_none(".create-related-media__add-button")
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    #Go to the trash page and restore the item
    wait_for_selector(".project-list__item-trash").click
    wait_for_selector_list_size(".media__heading",1)
    wait_for_selector(".media__heading").click
    wait_for_selector(".media-status")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector("#media-actions__restore").click
    wait_for_selector(".project-header__back-button").click
    wait_for_selector("#search-input")
    wait_for_selector(".project-list__link-all").click
    wait_for_selector(".media__heading")
    expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  end

  it "should restore items from the trash", bin2: true do
    create_media_depending_on_type
    wait_for_selector(".media")
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__send-to-trash").click
    wait_for_selector_none(".create-related-media__add-button")
    wait_for_selector(".message").click
    wait_for_selector(".project-header__back-button").click
    expect(@driver.find_elements(:css, '.medias__item').length == 0 )
    wait_for_selector(".project-list__item-trash").click #Go to the trash page
    wait_for_selector(".media__heading")
    wait_for_selector("body input[type='checkbox']:not(:checked)").click
    wait_for_selector("#media-bulk-actions__actions").click
    wait_for_selector(".message")
    wait_for_selector(".projects__list a[href$='/all-items']").click
    wait_for_selector_list_size(".medias__item", 1, :css)
    expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  end
end
