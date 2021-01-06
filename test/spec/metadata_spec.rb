shared_examples 'metadata' do
  it 'should manage metadata', bin3: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__metadata-tab').click
    wait_for_selector("//span[contains(text(), 'Metadata')]", :xpath)

    # Create metadata
    expect(@driver.page_source.include?('No metadata fields')).to be(true)
    expect(@driver.page_source.include?('my metadata')).to be(false)
    create_team_data_field(tab_class: '.team-settings__metadata-tab', task_type_class: '.create-task__add-short-answer', task_name: 'my metadata')
    expect(@driver.page_source.include?('No metadata fields')).to be(false)
    expect(@driver.page_source.include?('my metadata')).to be(true)

    # Edit metadata
    edit_team_data_field('my metadata - Edited')
    expect(@driver.page_source.include?('my metadata - Edited')).to be(true)

    # create 'data and time' metadata
    expect(@driver.page_source.include?('my data time metadata')).to be(false)
    create_team_data_field(task_type_class: '.create-task__add-datetime', task_name: 'my data time metadata')
    expect(@driver.page_source.include?('my data time metadata')).to be(true)

    # change the metadata order
    task = wait_for_selector('.team-tasks__task-label > span > span') # first metadata
    expect(task.text).to eq 'my metadata - Edited'
    wait_for_selector('.reorder__button-down').click
    task = wait_for_selector('.team-tasks__task-label > span > span') # the second becomes the first
    expect(task.text).to eq 'my data time metadata'

    # delete metadata
    delete_team_data_field
    expect(@driver.page_source.include?('my data time metadata')).to be(false)
  end

  it 'should add, edit and delete a metadata response', bin5: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__metadata-tab').click
    wait_for_selector("//span[contains(text(), 'Metadata')]", :xpath)

    # Create metadata
    expect(@driver.page_source.include?('No metadata fields')).to be(true)
    expect(@driver.page_source.include?('my metadata')).to be(false)
    create_team_data_field(task_type_class: '.create-task__add-short-answer', task_name: 'my metadata')
    expect(@driver.page_source.include?('No metadata fields')).to be(false)
    expect(@driver.page_source.include?('my metadata')).to be(true)

    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('#search-input')
    # create media and to go media page
    create_media('media', false)
    item = wait_for_selector('.medias__item', :css, 20, true)
    item.click
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.task-type__free_text')
    expect(@driver.page_source.include?('my metadata')).to be(true)

    # answer the metadata
    wait_for_selector('#task__response-input').send_keys('answer')
    @driver.action.send_keys(:enter).perform

    # edit response
    expect(@driver.page_source.include?('answer - edited')).to be(false)
    edit_task_response(selector: '#task__response-input', response: 'answer - edited')
    expect(@driver.page_source.include?('answer - edited')).to be(true)

    # delete response
    delete_task_response
    wait_for_selector_none('.task__response')
    expect(@driver.page_source.include?('answer - edited')).to be(false)
  end
end
