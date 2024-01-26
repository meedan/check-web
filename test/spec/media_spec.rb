require_relative 'spec_helper'

shared_examples 'media' do |type|
  before :each do
    @type = type
  end

  def create_media_depending_on_type(url = nil, media = 1)
    case @type
    when 'DOES_NOT_BELONG_TO_ANY_PROJECT'
      if media == 1
        url.nil? ? api_create_team_and_claim_and_redirect_to_media_page({ quote: "Orphan #{Time.now.to_f}" }) : api_create_team_and_bot_and_link_and_redirect_to_media_page({ url: url })
      else
        api_create_team_claims_sources_and_redirect_to_all_items({ count: media })
      end
    end
  end

  it 'should restore items from the trash', bin2: true do
    create_media_depending_on_type
    wait_for_selector('.test__media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__send-to-trash').click
    wait_for_selector('.message')
    wait_for_selector('#notistack-snackbar a').click
    wait_for_selector('.media__heading')
    wait_for_selector("table input[type='checkbox']").click
    wait_for_selector("//span[contains(text(), '(1 selected)')]", :xpath)
    wait_for_selector('#bulk-actions-menu__button').click
    wait_for_selector('.bulk-actions-menu__restore').click
    wait_for_selector('.message')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector_list_size('.medias__item', 1, :css)
    expect(@driver.find_elements(:css, '.media__heading').size == 1).to be(true)
  end
end
