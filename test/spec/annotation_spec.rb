shared_examples 'annotation' do
  it 'should manage annotation', bin3: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__metadata-tab', :css, 30).click
    wait_for_selector("//span[contains(text(), 'annotation')]", :xpath)

    # Create annotation
    expect(@driver.page_source.include?('No Workspace Annotations')).to be(true)
    expect(@driver.page_source.include?('my metadata')).to be(false)
    create_annotation(tab_class: '.team-settings__metadata-tab', task_type_class: '.edit-task-dialog__menu-item-free_text', task_name: 'my metadata')
    expect(@driver.page_source.include?('No Workspace Annotations')).to be(false)
    expect(@driver.page_source.include?('my metadata')).to be(true)

    # Edit annotation
    edit_annotation('my metadata - Edited')
    wait_for_selector("//strong[contains(text(), 'Edited')]", :xpath)
    expect(@driver.page_source.include?('my metadata - Edited')).to be(true)

    # Edit annotation type
    edit_annotation('.edit-task-dialog__menu-item-number', 'edit type')
    wait_for_selector('input[type=number]')
    expect(@driver.page_source.include?('number')).to be(true)

    # create 'date and time' annotation
    expect(@driver.page_source.include?('my date time metadata')).to be(false)
    create_annotation(task_type_class: '.edit-task-dialog__menu-item-datetime', task_name: 'my date time metadata')
    expect(@driver.page_source.include?('my date time metadata')).to be(true)

    # change the metadata annotation
    task = wait_for_selector('.team-tasks__task-label') # first metadata
    expect(task.text).to eq 'my metadata - Edited'
    @driver.execute_script('window.scrollTo(0, 0)')
    wait_for_selector('.int-reorder__button-down').click
    wait_for_text_change('my metadata - Edited', '.team-tasks__task-label', :css)
    task = wait_for_selector('.team-tasks__task-label') # the second becomes the first
    expect(task.text).to eq 'my date time metadata'

    # delete annotation
    delete_annotation
    expect(@driver.page_source.include?('my date time metadata')).to be(false)
  end

  it 'should add, edit and delete a annotation response', bin1: true do
    api_create_team_metadata_and_media
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.task__response-inputs')
    # answer the annotation
    wait_for_selector('.form-edit').click
    wait_for_selector('.int-clear-input__button--textfield')
    wait_for_selector('#metadata-input').send_keys('answer')
    wait_for_selector('.form-save').click
    wait_for_selector('.form-edit')
    expect(@driver.page_source.include?('answer')).to be(true)
    expect(@driver.page_source.include?('answer - edited')).to be(false)
    # edit response
    wait_for_selector('.form-edit').click
    wait_for_selector('#metadata-input').send_keys(' - edited')
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    @driver.navigate.refresh
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.form-edit')
    wait_for_selector("//span[contains(text(), 'answer - edited')]", :xpath)
    expect(@driver.page_source.include?('answer - edited')).to be(true)
    # delete response
    wait_for_selector('.form-edit').click
    wait_for_selector('.int-clear-input__button--textfield').click
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-cancel')
    expect(@driver.page_source.include?('answer - edited')).to be(false)
  end

  it 'should add, and answer a datetime annotation', bin3: true do
    api_create_team_metadata_and_claim({ quote: 'item item', type: 'datetime', options: '[{"code":"UTC","label":"UTC (0 GMT)","offset":0}]' })
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.task__response-inputs')
    # answer the annotation
    wait_for_selector('.form-edit').click
    wait_for_selector('.form-cancel')
    wait_for_selector('.task__response input').send_keys('2021/12/12')
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    expect(@driver.page_source.include?('Saved a few')).to be(true)
  end

  it 'should add, and answer a single choice annotation', bin2: true do
    api_create_team_metadata_and_claim({ quote: 'item item', type: 'single_choice', options: '[{"label": "Foo"}, {"label": "Bar"}]' })
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    # answer the annotation
    wait_for_selector('.form-edit').click
    wait_for_selector('input[name=Foo]').click
    wait_for_selector('.form-save').click
    wait_for_selector('.form-edit').click
    wait_for_selector('input[name=Bar]').click
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    expect(@driver.page_source.include?('Saved a few')).to be(true)
  end

  it 'should add, and answer a multiple choice annotation', bin4: true do
    api_create_team_metadata_and_claim({ quote: 'item item', type: 'multiple_choice', options: '[{"label": "Foo"}, {"label": "Bar"}]' })
    wait_for_selector('#search-input')
    wait_for_selector('.cluster-card').click
    wait_for_selector('.media__annotations-tabs')
    wait_for_selector('.media-tab__metadata').click
    wait_for_selector('.task__response-inputs')
    # answer the annotation
    wait_for_selector('.form-edit').click
    wait_for_selector('input[name=Foo]').click
    wait_for_selector('.form-save').click
    wait_for_selector('.form-edit').click
    wait_for_selector('input[name=Bar]').click
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    expect(@driver.page_source.include?('Saved a few')).to be(true)
  end
end
