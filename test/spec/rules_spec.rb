shared_examples 'rules' do
  it 'should set, edit and delete rules', bin3: true do
    user = api_register_and_login_with_email
    t = api_create_team(user: user)

    # Go to rules page
    @driver.navigate.to "#{@config['self_url']}/#{t.slug}/settings"
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('#tableTitle')

    # No rules
    expect(@driver.page_source.include?('0 rules')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(false)

    # Create new rule and check that form is blank
    wait_for_selector('.rules__new-rule').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(false)
    expect(@driver.page_source.include?('keyword')).to be(false)
    expect(@driver.page_source.include?('foo,bar')).to be(false)
    expect(@driver.page_source.include?('Move item to list')).to be(false)
    expect(@driver.page_source.include?('Select destination list')).to be(false)

    # Select a condition and set a value for it
    wait_for_selector('.rules__rule-field button + button').click
    wait_for_selector('button[title=Close]')
    wait_for_selector('ul[role=listbox] li[data-option-index="6"]').click
    wait_for_selector('.rules__rule-field textarea').send_keys('foo,bar')

    # Select an action
    wait_for_selector('.rules__actions .rules__rule-field button + button').click
    wait_for_selector_list('button[aria-label="Open"]')[1].click
    wait_for_selector('button[title=Close]')
    wait_for_selector('ul[role=listbox] li[data-option-index="2"]').click
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    # Set rule name
    wait_for_selector('input[name="rule-name"]').click
    @driver.action.send_keys('Rule 1').perform

    # Save
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(true)

    # Open
    wait_for_selector('tbody tr').click
    wait_for_selector('input')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move item to list')).to be(true)
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    # Reload the page and make sure that everything was saved correctly and is displayed correctly
    @driver.navigate.refresh
    wait_for_selector('.team-settings__rules-tab').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    wait_for_selector('tbody tr').click
    wait_for_selector('input[name="rule-name"]')
    expect(@driver.page_source.include?('Rule 1')).to be(true)
    expect(@driver.page_source.include?('keyword')).to be(true)
    expect(@driver.page_source.include?('foo,bar')).to be(true)
    expect(@driver.page_source.include?('Move item to list')).to be(true)
    expect(@driver.page_source.include?('Select destination list')).to be(true)

    # edit rule
    wait_for_selector('input[name="rule-name"]').send_keys('- Edited')
    wait_for_selector('.rules__save-button').click
    wait_for_selector('#tableTitle')
    expect(@driver.page_source.include?('1 rule')).to be(true)
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(true)

    # delet rule
    wait_for_selector('tbody tr').click
    wait_for_selector("//span[contains(text(), 'More')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Delete')]", :xpath).click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Rule 1- Edited')).to be(false)
  end
end
