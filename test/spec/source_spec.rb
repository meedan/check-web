require_relative 'spec_helper'

shared_examples 'source' do
  it 'should check, edit and remove source info', bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://g1.globo.com/'
    wait_for_selector('.media')
    wait_for_selector('.media-tags__list')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('.source__name')
    expect(wait_for_selector('.source__name').text == 'G1').to be(true)
    wait_for_selector('#source__name-input').send_keys('- Edited')
    @driver.action.send_keys(:enter).perform
    wait_for_text_change('Globo', '.source__name', :css)
    expect(wait_for_selector('.source__name').text == 'G1- Edited').to be(true)
    # check main link
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://g1.globo.com/').to be(true)
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 1).to be(true)
    # add a secondary link
    wait_for_selector('.source__add-link-button').click
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source__link-item0')
    # remove main link
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 2).to be(true)
    wait_for_selector_list('.source__remove-link-button')[0].click
    wait_for_text_change('https://edition.cnn.com', '#main_source__link', :css)
    # check that the main link was changed
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/news/uk').to be(true)
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 1).to be(true)
    wait_for_selector('.source__add-link-button').click
    # try add the same source again
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source__link-input-new-helper-text')
    expect(@driver.page_source.include?('Account has already been taken')).to be(true)
  end

  it 'should add a existing source for a media', bin6: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.cnnbrasil.com.br/'
    wait_for_selector('.media')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('.source__name')
    expect(wait_for_selector('.source__name').text == 'CNN Brasil').to be(true)
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    wait_for_selector_list_size('.medias__item', 1)
    # create another media and add a existing source
    create_media('media 2')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('.media-source__save-button')
    wait_for_selector('input[name=source-name]').send_keys('CNN')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#media_source-change')
    expect(wait_for_selector('.source__name').text == 'CNN Brasil').to be(true)
  end

  it 'should add a new source for a media', bin6: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media')
    wait_for_selector('.media-tab__source').click
    expect(@driver.page_source.include?('BBC')).to be(false)
    wait_for_selector("//span[contains(text(), 'Create new')]", :xpath).click
    wait_for_selector('#source__name-input').send_keys('BBC')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source_primary__link-input').send_keys('https://www.bbc.com/portuguese')
    wait_for_selector('.source__edit-save-button').click
    wait_for_selector_none('.source__edit-cancel-button')
    expect(wait_for_selector('.source__name').text == 'BBC').to be(true)
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/portuguese').to be(true)
  end
end
