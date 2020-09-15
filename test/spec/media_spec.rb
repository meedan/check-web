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

  it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
    create_media_depending_on_type
    wait_for_selector(".media-detail")
    new_tag = 'tag:'+Time.now.to_i.to_s
    # Validate assumption that tag does not exist
    expect(@driver.page_source.include?(new_tag)).to be(false)
    # Add tag
    add_tag(new_tag)
    @wait.until { (@driver.page_source.include?(new_tag)) }
    # Try to add duplicate
    wait_for_selector(".tag-menu__icon").click
    fill_field('#tag-input__tag-input', new_tag)
    @driver.action.send_keys(:enter).perform
    @wait.until { (@driver.page_source.include?('Tag already exists')) }
    wait_for_selector(".tag-menu__done").click
    # Verify that tag is not added and that error message is displayed
    wait_for_selector_none("#tag-input__tag-input")
    expect(@driver.find_elements(:class, "media-tags__tag").length).to eq 1
    delete_tag(new_tag)
    wait_for_selector_none(".media-tags__tag")
    expect(@driver.find_elements(:class, "media-tags__tag").length).to eq 0
  end

  it "should go from one item to another", bin2: true do
    create_media_depending_on_type(nil, 3)
    wait_for_selector(".projects__list")
    wait_for_selector(".medias__item")
    wait_for_selector('.media__heading a').click
    wait_for_selector('.media-search__actions-bar')

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
    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(true)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Third item
    wait_for_selector('.media-search__next-item').click
    wait_for_selector('.media-search__actions-bar')

    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(true)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
  end

  it "should update notes count after delete annotation", bin3: true do
    create_media_depending_on_type
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".annotations__list")
    fill_field('#cmd-input', 'Comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__avatar-col')
    wait_for_selector(".media-tab__activity").click
    expect(@driver.find_elements(:class, "annotation__timestamp").length == 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector(".media-tab__comments").click
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    wait_for_selector(".media-tab__activity").click
    notes_count = wait_for_selector_list('.annotation__timestamp').length
    expect(notes_count > 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it "should change the status to true and manually add new related items" , bin1: true do
    create_media_depending_on_type
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Verified')).to be(false)
    change_the_status_to('.media-status__menu-item--verified', false)
    expect(@driver.page_source.include?('verified')).to be(true)
    expect(@driver.page_source.include?('Related Claim')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media-dialog__tab-new').click
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Related Claim')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Related Claim')).to be(true)
  end
end
