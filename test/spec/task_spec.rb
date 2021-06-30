shared_examples 'task' do
  it 'should add, edit, answer, update answer and delete geolocation task', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('Where?')).to be(false)
    create_task(task_type_class: '.create-task__add-geolocation', task_name: 'Where?')
    expect(@driver.page_source.include?('Where?')).to be(true)

    # Answer task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
    answer_task(selector: 'textarea[name="response"]', response: 'Salvador', selector_two: '#task__response-geolocation-coordinates', response_two: '-12.9015866, -38.560239')
    wait_for_selector("//span[contains(text(), 'Completed by')]", :xpath)
    expect(@driver.page_source.include?('Completed by')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Where was it?')).to be(false)
    edit_task('Where was it?')
    expect(@driver.page_source.include?('Where was it?')).to be(true)

    # Edit task answer
    expect(@driver.page_source.gsub(%r{</?[^>]*>}, '').include?('Vancouver')).to be(false)
    edit_task_response(selector: 'textarea[name="response"]', response: 'Vancouver', selector_two: '#task__response-geolocation-coordinates', response_two: '9.2577142, -123.1941156')
    expect(@driver.page_source.include?('Vancouver')).to be(true)

    # Delete task
    delete_task
    expect(@driver.page_source.include?('Where was it?')).to be(false)
  end

  it 'should assign, answer with a link and add a comment to a task and change the task order', bin4: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('Task 1')).to be(false)
    create_task(task_type_class: '.create-task__add-short-answer', task_name: 'Task 1')
    expect(@driver.page_source.include?('Task 1')).to be(true)

    # assign the task
    expect(@driver.page_source.include?('Assigned to')).to be(false)
    wait_for_selector('#task__response-input')
    assign_task
    expect(@driver.page_source.include?('Assigned to')).to be(true)

    # insert a image
    add_image_note('test.png')
    wait_for_selector('.annotation__timestamp')
    expect(@driver.find_elements(:class, 'annotation__card-thumbnail').length).to eq 1

    # Answer with link
    wait_for_selector('.task__log-icon > svg').click
    answer_task(selector: 'textarea[name="response"]', response: 'https://www.youtube.com/watch?v=ykLgjhBnik0')
    wait_for_selector("//span[contains(text(), 'Completed by')]", :xpath)
    expect(@driver.find_elements(:css, '.task__response').size).to eq 1

    # Add comment to task
    expect(@driver.page_source.include?('This is a comment under a task')).to be(false)
    add_task_comment('This is a comment under a task')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector("//span[contains(text(), 'Task note added')]", :xpath)
    expect(@driver.page_source.include?('This is a comment under a task')).to be(true)

    # Dismiss dialog
    wait_for_selector('#item-history__close-button').click

    # Create another task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('Task 2')).to be(false)
    create_task(task_type_class: '.create-task__add-short-answer', task_name: 'Task 2')
    expect(@driver.page_source.include?('Task 2')).to be(true)

    # change the task order
    task = wait_for_selector('.task__label-container > div > span') # first task
    expect(task.text).to eq 'Task 1'
    wait_for_selector('.reorder__button-down').click
    task2 = wait_for_selector('.task__label-container > div > span') # the second becomes the first
    expect(task2.text).to eq 'Task 2'
  end

  it 'should add, edit, answer, update answer and delete datetime task', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('When?')).to be(false)
    create_task(task_type_class: '.create-task__add-datetime', task_name: 'When?')
    wait_for_selector('.task ')
    expect(@driver.page_source.include?('When?')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Task completed by')).to be(false)
    wait_for_selector('.task__response-input').click
    wait_for_selector('.MuiPickersDay-daySelected').click
    sleep 2
    @driver.action.send_keys(:escape).perform
    wait_for_selector('.task__save').click
    wait_for_selector("//span[contains(text(), 'Completed by')]", :xpath)
    expect(@driver.page_source.include?('Completed by')).to be(true)

    # Edit task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('When was it?')).to be(false)
    edit_task('When was it?')
    expect(@driver.page_source.include?('When was it?')).to be(true)

    # Delete task
    delete_task
    expect(@driver.page_source.include?('When was it')).to be(false)
  end

  it 'should add, edit, answer, update answer and delete short answer task', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)
    create_task(task_type_class: '.create-task__add-short-answer', task_name: 'Foo or bar?')
    wait_for_selector('.task-type__free_text')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Completed by')).to be(false)
    answer_task(selector: '#task__response-input', response: 'Foo')
    wait_for_selector('.task__response')
    expect(@driver.page_source.include?('Completed by')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Foo or bar???')).to be(false)
    edit_task('Foo or bar???')
    expect(@driver.page_source.include?('Foo or bar???')).to be(true)

    # Edit task answer
    expect(@driver.page_source.include?('Foo edited')).to be(false)
    edit_task_response(selector: '#task__response-input', response: 'Foo edited')
    expect(@driver.page_source.include?('Foo edited')).to be(true)

    # Delete task
    delete_task
  end

  it 'should add, edit, answer, update answer and delete single_choice task', bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')

    # Create a task
    wait_for_selector('.media-tab__tasks').click
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)
    create_task(task_type_class: '.create-task__add-choose-one', task_name: 'Foo or bar?', value1: 'Foo', value2: 'Bar')
    wait_for_selector('.task-type__single_choice')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)

    # Answer task
    answer_task(task_type_class: '.create-task__add-choose-one', choice: '0')
    wait_for_selector('#user__avatars')
    expect(@driver.page_source.include?('Completed by')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Foo or bar???')).to be(false)
    edit_task('Foo or bar???')
    expect(@driver.page_source.include?('Foo or bar???')).to be(true)

    # Edit task answer
    edit_task_response(task_type_class: '.create-task__add-choose-one', choice: '1')

    # Delete task
    delete_task
    expect(@driver.page_source.include?('Foo or bar???')).to be(false)
  end

  it 'should add, edit, answer, update answer and delete multiple_choice task', bin6: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    # Create a task
    expect(@driver.page_source.include?('Foo, Doo or Bar?')).to be(false)
    wait_for_selector('.media-tab__tasks').click
    create_task(task_type_class: '.create-task__add-choose-multiple', task_name: 'Foo, Doo or Bar?', value1: 'Foo', value2: 'Bar', add_options: true, value3: 'Doo')
    expect(@driver.page_source.include?('Foo, Doo or Bar?')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Completed by')).to be(false)
    answer_task(task_type_class: '.create-task__add-choose-multiple', choice: 'Foo', choice_two: 'Doo')
    wait_for_selector('#user__avatars')
    expect(@driver.page_source.include?('Completed by')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Foo, Doo or Bar???')).to be(false)
    edit_task('Foo, Doo or Bar???')
    expect(@driver.page_source.include?('Foo, Doo or Bar???')).to be(true)

    # Edit task answer
    edit_task_response(task_type_class: '.create-task__add-choose-one', choice: 'Doo')

    # Delete task
    delete_task
    expect(@driver.page_source.include?('Foo, Doo or Bar???')).to be(false)
  end

  it 'should manage, search by keywords and filter team tasks', bin6: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__tasks-tab', :css, 30).click
    wait_for_selector("//span[contains(text(), 'No default tasks')]", :xpath)
    expect(@driver.page_source.include?('No default tasks to display')).to be(true)
    expect(@driver.page_source.include?('New teamwide task')).to be(false)

    # Create task
    create_team_data_field(task_type_class: '.create-task__add-short-answer', task_name: 'New teamwide task')
    expect(@driver.page_source.include?('No default tasks to display')).to be(false)
    expect(@driver.page_source.include?('New teamwide task')).to be(true)

    # Edit task
    edit_team_data_field('New teamwide task-EDITED')
    expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)

    # Add new task
    create_team_data_field(tab_class: '.team-settings__tasks-tab', task_type_class: '.create-task__add-geolocation', task_name: 'geolocation task')
    expect(@driver.page_source.include?('geolocation task')).to be(true)

    # Change the task order
    task = wait_for_selector('.team-tasks__task-label > span > span') # first task
    expect(task.text).to eq 'New teamwide task-EDITED'
    @driver.execute_script('window.scrollTo(0, 0)')
    wait_for_selector('.reorder__button-down').click
    wait_for_text_change('geolocation task', '.team-tasks__task-label > span > span')
    task = wait_for_selector('.team-tasks__task-label > span > span') # the second becomes the first
    expect(task.text).to eq 'geolocation task'

    # Search task by keyword
    wait_for_selector('.filter-popup > div > button > span > svg').click
    wait_for_selector('input[name="filter-search"]').send_keys('New')
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    wait_for_selector_none('input[name="filter-search"]')
    expect(@driver.page_source.include?('New teamwide task-EDITED')).to be(true)
    expect(@driver.page_source.include?('geolocation task')).to be(false)

    # Filter by type
    wait_for_selector('.filter-popup > div > button > span > svg').click
    wait_for_selector('input[name="filter-search"]').send_keys(:control, 'a', :delete)
    wait_for_selector("//span[contains(text(), 'All tasks')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Location')]", :xpath).click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    wait_for_selector_none('input[name="filter-search"]')
    expect(@driver.page_source.include?('geolocation task')).to be(true)

    # Delete task
    delete_team_data_field
    expect(@driver.page_source.include?('geolocation task')).to be(false)
    expect(@driver.page_source.include?('No default tasks to display')).to be(true)
  end

  # it 'should search map in geolocation task', bin3: true do
  #   api_create_team_project_and_claim_and_redirect_to_media_page
  #   wait_for_selector('.media-detail')

  #   wait_for_selector('.media-actions__icon').click
  #   wait_for_selector('.media-actions__history').click
  #   wait_for_size_change(0, 'annotations__list-item', :class)
  #   wait_for_selector('#item-history__close-button').click
  #   wait_for_selector('.media-tab__tasks').click

  #   # Create a task
  #   expect(@driver.page_source.include?('Where?')).to be(false)
  #   expect(@driver.page_source.include?('Task "Where?" created by')).to be(false)
  #   create_task(task_type_class: '.create-task__add-geolocation', task_name: 'Where?')
  #   expect(@driver.page_source.include?('Where?')).to be(true)

  #   # Search map
  #   expect(@driver.page_source.include?('Brazil')).to be(false)
  #   wait_for_selector('#task__response-geolocation-name')
  #   fill_field('#geolocationsearch', 'Sao Paulo ')
  #   wait_for_selector('#geolocationsearch-option-0')
  #   wait_for_selector('#geolocationsearch').click
  #   wait_for_selector('#geolocationsearch').send_keys(:arrow_down)
  #   @driver.action.send_keys(:enter).perform
  #   wait_for_text_change(' ', '#task__response-geolocation-name')
  #   expect(@driver.page_source.include?('Brazil')).to be(true)
  # end
end
