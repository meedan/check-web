shared_examples 'rules' do
  it 'should set, edit and delete rules', bin3: true do
    user = api_register_and_login_with_email
    t = api_create_team(user: user)

    # Go to rules page
    @driver.navigate.to "#{@config['self_url']}/#{t.slug}/settings"
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('.team-settings__rules-list-wrapper')

    # No rules
    expect(@driver.page_source.include?('Rule 1')).to be(false)

    # Create new rule and check that form is blank
    wait_for_selector('.int-rules-table__button--new-rule').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(false)
    expect(@driver.page_source.include?('keyword')).to be(false)
    expect(@driver.page_source.include?('foo,bar')).to be(false)
    expect(@driver.page_source.include?('Move item to list')).to be(false)
    expect(@driver.page_source.include?('Select destination list')).to be(false)

    # Select a condition and set a value for it
    wait_for_selector('.MuiAutocomplete-input').click
    wait_for_selector('.MuiAutocomplete-inputFocused').click
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.rules__rule-field .int-rules__rule-field-string-input input').send_keys('foo,bar')

    # Select an action
    wait_for_selector('.rules__actions .rules__rule-field input[type=text]').click
    wait_for_selector('.rules__actions .rules__rule-field input[type=text]').send_keys('move')

    # Selecting second option, "Move to Trash"
    wait_for_selector('ul[role=listbox] li[data-option-index="0"]').click

    # Set rule name
    wait_for_selector('input[name="rule-name"]').click
    @driver.action.send_keys('Rule 1').perform

    # Save
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#rules-table')
    expect(@driver.page_source.include?('Rule 1')).to be(true)

    # Open
    wait_for_selector('.int-rules-table__button--rule-menu').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move to Trash')).to be(true)

    # Reload the page and make sure that everything was saved correctly and is displayed correctly
    @driver.navigate.refresh
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('#rules-table')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    wait_for_selector('.int-rules-table__button--rule-menu').click
    wait_for_selector('input[name="rule-name"]')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move to Trash')).to be(true)

    # Edit rule
    wait_for_selector('input[name="rule-name"]').send_keys('- Edited')
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#rules-table')
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(true)

    # Delete rule
    wait_for_selector('.int-rules-table__button--rule-menu').click
    wait_for_selector("//span[contains(text(), 'More')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Delete')]", :xpath).click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.int-flash-message__toast')
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(false)
  end
end
