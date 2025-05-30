require_relative 'spec_helper'

shared_examples 'source' do
  it 'should add a new source for a media, edit and remove source info', bin3: true do
    api_create_team_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-card-large')
    # create source
    wait_for_selector('.media-tab__source').click
    expect(@driver.page_source.include?('BBC')).to be(false)
    wait_for_selector("//span[contains(text(), 'Create new')]", :xpath).click
    wait_for_selector('#source__name-input').send_keys('BBC')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source_primary__link-input').send_keys('https://www.bbc.com/portuguese')
    wait_for_selector('.source__edit-save-button').click
    @driver.navigate.refresh
    wait_for_selector('.media-card-large')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('#source__name-input')
    expect(wait_for_selector('.source__name').text == 'BBC').to be(true)
    wait_for_selector('#source__name-input').send_keys('- Edited')
    @driver.action.send_keys(:enter).perform
    wait_for_text_change('BBC', '.source__name', :css)
    wait_for_selector("//h6[contains(text(), 'BBC- Edited')]", :xpath)
    expect(@driver.page_source.include?('BBC- Edited')).to be(true)
    # check main link
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/portuguese').to be(true)
    expect(@driver.find_elements(:css, '.int-clear-input__button--textfield').length == 1).to be(true)
    # add a secondary link
    wait_for_selector('.source__add-link-button').click
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector_list_size('.int-clear-input__button--textfield', 2)
    # remove main link
    expect(@driver.find_elements(:css, '.int-clear-input__button--textfield').length == 2).to be(true)
    wait_for_selector_list('.int-clear-input__button--textfield')[0].click
    wait_for_selector_none('#source__link-input0')
    # check that the main link was changed
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/news/uk').to be(true)
    expect(@driver.find_elements(:css, '.int-clear-input__button--textfield').length == 1).to be(true)
    wait_for_selector('.source__add-link-button').click
    # try to add the same source again
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.int-error__message--textfield')
    expect(@driver.page_source.include?('Account has already been taken')).to be(true)
  end
end
