shared_examples 'metadata' do
  it 'should manage metadata', bin3: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__metadata-tab', :css, 30).click
    wait_for_selector("//span[contains(text(), 'metadata')]", :xpath)

    # Create metadata
    expect(@driver.page_source.include?('No metadata fields')).to be(true)
    expect(@driver.page_source.include?('my metadata')).to be(false)
    create_team_data_field(tab_class: '.team-settings__metadata-tab', task_type_class: '.create-task__add-short-answer', task_name: 'my metadata')
    expect(@driver.page_source.include?('No metadata fields')).to be(false)
    expect(@driver.page_source.include?('my metadata')).to be(true)

    # Edit metadata
    edit_team_data_field('my metadata - Edited')
    wait_for_selector("//span[contains(text(), 'Edited')]", :xpath)
    expect(@driver.page_source.include?('my metadata - Edited')).to be(true)

    # create 'date and time' metadata
    expect(@driver.page_source.include?('my date time metadata')).to be(false)
    create_team_data_field(task_type_class: '.create-task__add-datetime', task_name: 'my date time metadata')
    expect(@driver.page_source.include?('my date time metadata')).to be(true)

    # change the metadata order
    task = wait_for_selector('.team-tasks__task-label > span > span') # first metadata
    expect(task.text).to eq 'my metadata - Edited'
    @driver.execute_script('window.scrollTo(0, 0)')
    wait_for_selector('.reorder__button-down').click
    wait_for_text_change('my metadata - Edited', '.team-tasks__task-label > span > span', :css)
    task = wait_for_selector('.team-tasks__task-label > span > span') # the second becomes the first
    expect(task.text).to eq 'my date time metadata'

    # delete metadata
    delete_team_data_field
    expect(@driver.page_source.include?('my date time metadata')).to be(false)
  end

  it 'should add, edit and delete a metadata response', bin5: true do
    api_create_team_project_metadata_and_media
    wait_for_selector('#search-input')
    wait_for_selector('.medias__item', :css, 20, true).click
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.task__response-inputs')
    # answer the metadata
    wait_for_selector('#metadata-input').send_keys('answer')
    wait_for_selector('.metadata-save').click

    # edit response
    expect(@driver.page_source.include?('answer - edited')).to be(false)
    wait_for_selector('.metadata-edit').click
    wait_for_selector('#metadata-input').send_keys(' - edited')
    wait_for_selector('.metadata-save').click
    wait_for_selector_none('.metdata-cancel')
    expect(@driver.page_source.include?('answer - edited')).to be(true)

    # delete response
    wait_for_selector('.metadata-delete').click
    wait_for_selector_none('.metadata-delete')
    expect(@driver.page_source.include?('answer - edited')).to be(false)
  end
end
