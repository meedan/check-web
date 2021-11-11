require_relative 'spec_helper'

shared_examples 'media' do |type|
  before :each do
    @type = type
  end

  def create_media_depending_on_type(url = nil, media = 1)
    case @type
    when 'BELONGS_TO_ONE_PROJECT'
      if media == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page : api_create_team_project_and_link_and_redirect_to_media_page(url)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(media)
      end
    when 'DOES_NOT_BELONG_TO_ANY_PROJECT'
      if media == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page("Orphan #{Time.now.to_f}", nil) : api_create_team_project_and_link_and_redirect_to_media_page(url, nil)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(media, nil)
      end
    end
  end

  it 'should go from one item to another', bin2: true do
    create_media_depending_on_type(nil, 3)
    wait_for_selector('.projects-list')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading a').click
    wait_for_selector('.media-search__actions-bar')
    wait_for_selector('.media-detail')
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath)

    # First item
    expect(page_source_body.include?('1 of 3')).to be(true)
    expect(page_source_body.include?('2 of 3')).to be(false)
    expect(page_source_body.include?('3 of 3')).to be(false)
    expect(page_source_body.include?('Claim 2')).to be(true)
    expect(page_source_body.include?('Claim 1')).to be(false)
    expect(page_source_body.include?('Claim 0')).to be(false)

    # Second item
    wait_for_selector('.media-search__next-item').click
    wait_for_selector('.media-search__next-item')
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath)

    wait_for_selector('.media-detail')
    expect(page_source_body.include?('1 of 3')).to be(false)
    expect(page_source_body.include?('2 of 3')).to be(true)
    expect(page_source_body.include?('3 of 3')).to be(false)
    expect(page_source_body.include?('Claim 2')).to be(false)
    expect(page_source_body.include?('Claim 1')).to be(true)
    expect(page_source_body.include?('Claim 0')).to be(false)

    # Third item
    wait_for_selector('.media-search__next-item').click
    wait_for_selector('.media-search__next-item')
    wait_for_selector("//span[contains(text(), 'Similar media')]", :xpath)
    wait_for_selector('.media-detail')

    expect(page_source_body.include?('1 of 3')).to be(false)
    expect(page_source_body.include?('2 of 3')).to be(false)
    expect(page_source_body.include?('3 of 3')).to be(true)
    expect(page_source_body.include?('Claim 2')).to be(false)
    expect(page_source_body.include?('Claim 1')).to be(false)
    expect(page_source_body.include?('Claim 0')).to be(true)
  end

  it 'should update notes count after delete annotation', bin3: true do
    create_media_depending_on_type
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotations__list')
    fill_field('#cmd-input', 'Comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__avatar-col')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    expect(@driver.find_elements(:class, 'annotation__timestamp').length == 1).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector('#item-history__close-button').click
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    notes_count = wait_for_selector_list('.annotation__timestamp').length
    expect(notes_count.positive?).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it 'should restore item from trash from item page', bin6: true do
    create_media_depending_on_type
    wait_for_selector('.media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__send-to-trash').click
    wait_for_selector('.message').click
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    expect(@driver.find_elements(:css, '.medias__item').empty?)
    # Go to the trash page and restore the item
    wait_for_selector('.project-list__item-trash').click
    wait_for_selector_list_size('.media__heading', 1)
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-status')
    wait_for_selector('#media-actions-bar__restore-confirm-to').click
    wait_for_selector('input[name=project-title]').send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-actions-bar__add-button').click
    wait_for_selector_none('input[name=project-title]') # wait for dialog to disappear
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    wait_for_selector('.project-list__link', index: 0).click # Go to target project
    wait_for_selector_list_size('.medias__item', 1, :css)
    expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  end

  it 'should restore items from the trash', bin2: true do
    create_media_depending_on_type
    wait_for_selector('.media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__send-to-trash').click
    wait_for_selector('.message')
    wait_for_selector('#notistack-snackbar a').click
    wait_for_selector('.media__heading')
    wait_for_selector("table input[type='checkbox']").click
    wait_for_selector("//span[contains(text(), '(1 selected)')]", :xpath)
    wait_for_selector('#media-bulk-actions__move-to').click
    wait_for_selector('input[name=project-title]').send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('div[aria-expanded=false]')
    wait_for_selector('.media-bulk-actions__move-button').click
    wait_for_selector('.message')
    wait_for_selector('.project-list__link', index: 0).click # Go to target project
    wait_for_selector_list_size('.medias__item', 1, :css)
    expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  end
end
