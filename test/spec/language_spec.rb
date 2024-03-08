shared_examples 'language' do
  it 'should manage workspace languages', bin2: true do
    api_create_team_and_claim_and_redirect_to_media_page
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/settings/languages"
    wait_for_selector('.language-list-item__en-default')
    expect(@driver.page_source.include?('language-list-item__en-default')).to be(true)
    expect(@driver.page_source.include?('English')).to be(true)
    # verify that "make default" action is blocked for default language
    wait_for_selector_list('.language-actions__menu')[0].click
    expect(@driver.find_elements(:css, '.language-actions__make-default[aria-disabled=true]').size).to eq 1
    @driver.action.send_keys(:escape).perform
    # add translated language
    wait_for_selector('.add-language-action__add-button').click
    wait_for_selector('.add-language-action__cancel')
    wait_for_selector('#autocomplete-add-language').send_keys('español')
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.add-language-action__submit').click
    wait_for_selector('.language-list-item__es')
    expect(@driver.page_source.include?('language-list-item__es')).to be(true)
    expect(@driver.page_source.include?('Español')).to be(true)
    # set as default
    wait_for_selector('.language-list-item__es')
    wait_for_selector_list('.language-actions__menu')[1].click
    wait_for_selector('.language-actions__make-default').click
    wait_for_selector('.int-confirm-proceed-dialog__proceed').click
    @driver.navigate.refresh
    wait_for_selector('.language-list-item__es-default')
    expect(@driver.page_source.include?('language-list-item__es-default')).to be(true)
    # add untranslated language
    wait_for_selector('.add-language-action__add-button').click
    wait_for_selector('.add-language-action__cancel')
    wait_for_selector('#autocomplete-add-language').send_keys('norsk')
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.add-language-action__submit').click
    wait_for_selector('.language-list-item__no')
    expect(@driver.page_source.include?('language-list-item__no')).to be(true)
    expect(@driver.page_source.include?('Norsk')).to be(true)
    # try to set as default but fail because statuses aren't translated to norsk
    wait_for_selector_list('.language-actions__menu')[2].click
    wait_for_selector('.language-actions__make-default').click
    expect(@driver.page_source.include?('need to translate all')).to be(true)
    wait_for_selector('.int-confirm-proceed-dialog__proceed').click
    # delete language
    wait_for_selector_list('.language-actions__menu')[2].click
    wait_for_selector('.language-actions__delete').click
    wait_for_selector('#confirm-proceed-dialog__confirmation-text').send_keys('Delete Norwegian / Norsk (no) and all content')
    wait_for_selector('.int-confirm-proceed-dialog__proceed').click
    wait_for_selector_none('.int-confirm-proceed-dialog__proceed')
    expect(@driver.page_source.include?('Nork')).to be(false)
  end
end
