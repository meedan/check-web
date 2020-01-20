require_relative 'spec_helper.rb'

shared_examples 'media' do |type|
  before :each do
    @type = type
  end

  def create_media_depending_on_type(url = nil, n = 1)
    case @type
    when 'BELONGS_TO_ONE_PROJECT'
      if n == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page : api_create_team_project_and_link_and_redirect_to_media_page(url)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(n)
      end
    when 'DOES_NOT_BELONG_TO_ANY_PROJECT'
      if n == 1
        url.nil? ? api_create_team_project_and_claim_and_redirect_to_media_page("Orphan #{Time.now.to_f}", nil) : api_create_team_project_and_link_and_redirect_to_media_page(url, nil)
      else
        api_create_team_project_claims_sources_and_redirect_to_project_page(n, nil)
      end
    end
  end

  it "should edit the description of a media", bin4: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.media-detail')
    media_pg.toggle_card # Make sure the card is closed
    expect(media_pg.contains_string?('Edited media description')).to be(false)
    media_pg.toggle_card # Expand the card so the edit button is accessible
    wait_for_selector('.media-actions')
    media_pg.set_description('Edited media description')
    expect(media_pg.contains_string?('Edited media description')).to be(true)
  end

  it "should edit the title of a media", bin1: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.media-detail')
    media_pg.toggle_card # Make sure the card is closed
    expect(@driver.page_source.include?('Edited media title')).to be(false)
    media_pg.toggle_card # Expand the card so the edit button is accessible
    wait_for_selector('.media-actions')
    media_pg.set_title('Edited media title')
    expect(@driver.page_source.include?('Edited media title')).to be(true)
  end

  it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
    page = create_media_depending_on_type
    wait_for_selector("add-annotation__insert-photo",:class)
    new_tag = Time.now.to_i.to_s
    # Validate assumption that tag does not exist
    expect(page.has_tag?(new_tag)).to be(false)
    # Add tag
    page.add_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(true)
    # Try to add duplicate
    page.add_tag(new_tag)
    @wait.until { @driver.page_source.include?('Validation') }
    expect(page.contains_string?('Tag already exists')).to be(true)
    # Verify that tag is not added and that error message is displayed
    expect(page.tags.count(new_tag)).to be(1)
    page.delete_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(false)
  end

  it "should embed", bin1: true do
    create_media_depending_on_type
    wait_for_selector(".tasks")
    request_api('make_team_public', { slug: get_team })

    @driver.navigate.refresh
    wait_for_selector('.media-detail')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__edit')
    expect(@driver.page_source.include?('Report')).to be(true)
    url = @driver.current_url.to_s
    wait_for_selector('.media-actions__embed').click
    wait_for_selector("#media-embed__actions")
    expect(@driver.current_url.to_s == "#{url}/embed").to be(true)
    expect(@driver.page_source.include?('Not available')).to be(false)
    @driver.find_elements(:css, 'body').map(&:click)
    el = wait_for_selector('#media-embed__actions-copy')
    el.click
    wait_for_selector("#media-embed__copy-code")
    @driver.navigate.to 'https://paste.ubuntu.com/'
    el = wait_for_selector('#id_content')
    el.send_keys(' ')
    @driver.action.send_keys(:control, 'v').perform
    wait_for_text_change(' ',"#id_content", :css)
    expect((@driver.find_element(:css, '#id_content').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it "should add, edit, answer, update answer and delete short answer task", bin3: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')

    # Create a task
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)
    expect(@driver.page_source.include?('Task created by User With Email: Foo or bar?')).to be(false)

    el = wait_for_selector('.create-task__add-button')
    el.click
    el = wait_for_selector('.create-task__add-short-answer')
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo or bar?')
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector('.annotation__task-created')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)
    expect(@driver.page_source.include?('Task created by')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
    fill_field('textarea[name="response"]', 'Foo')
    @driver.find_element(:css, '.task__save').click
    wait_for_selector('.annotation__task-resolved')
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Foo or bar???')).to be(false)
    el = wait_for_selector('.task-actions__icon')
    el.click
    editbutton = wait_for_selector('.task-actions__edit')
    editbutton.location_once_scrolled_into_view
    editbutton.click
    wait_for_selector("#task-description-input")
    fill_field('#task-label-input', '??')
    editbutton = wait_for_selector('.create-task__dialog-submit-button')
    editbutton.click
    wait_for_selector('.annotation__update-task')
    expect(@driver.page_source.include?('Foo or bar???')).to be(true)

    # Edit task answer
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(false)
    el = wait_for_selector('.task-actions__icon').click

    el = wait_for_selector('.task-actions__edit-response')
    el.click

    # Ensure menu closes and textarea is focused...
    el = wait_for_selector('textarea[name="response"]', :css)
    el.click
    wait_for_selector(".task__cancel")
    fill_field('textarea[name="response"]', ' edited')
    @driver.find_element(:css, '.task__save').click
    wait_for_selector_none(".task__cancel")
    media_pg.wait_all_elements(9, 'annotations__list-item', :class)
    wait_for_selector('.annotation--task_response_free_text')
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(true)

    # Delete task
    delete_task('Foo')
  end

  it "should add, edit, answer, update answer and delete single_choice task", bin2: true  do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')
    # Create a task
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)
    expect(@driver.page_source.include?('Task created by')).to be(false)
    el = wait_for_selector('.create-task__add-button')
    el.click
    el = wait_for_selector('.create-task__add-choose-one')
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo or bar?')
    fill_field('0', 'Foo', :id)
    fill_field('1', 'Bar', :id)
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector('.annotation__task-created')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)
    expect(@driver.page_source.include?('Task created by')).to be(true)
    # Answer task
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
    el = wait_for_selector('0', :id)
    el.click
    el = wait_for_selector('.task__submit')
    el.click
    wait_for_selector('.annotation__task-resolved')
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)
    # Edit task
    expect(@driver.page_source.include?('Task edited by')).to be(false)
    el = wait_for_selector('.task-actions__icon')
    el.click
    editbutton = wait_for_selector('.task-actions__edit')
    editbutton.location_once_scrolled_into_view
    editbutton.click
    fill_field('#task-label-input', '??')
    editbutton = wait_for_selector('.create-task__dialog-submit-button')
    editbutton.click
    wait_for_selector('.annotation__update-task')
    expect(@driver.page_source.include?('Task edited by')).to be(true)
    # Edit task answer

    el = wait_for_selector('.task-actions__icon').click
    el = wait_for_selector('.task-actions__edit-response')
    el.click
    el = wait_for_selector('1', :id)
    el.click
    el = wait_for_selector('task__submit', :class)
    el.click
    wait_for_selector('.annotation--task_response_single_choice')
    # Delete task
    delete_task('Foo')
  end

  it "should add, edit, answer, update answer and delete multiple_choice task", bin5: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')
    # Create a task
    expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(false)
    expect(@driver.page_source.include?('Task created by')).to be(false)
    el = wait_for_selector('.create-task__add-button')
    el.click
    el = wait_for_selector('create-task__add-choose-multiple', :class)
    el.location_once_scrolled_into_view
    el.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo, Doo or bar?')
    fill_field('0', 'Foo', :id)
    fill_field('1', 'Bar', :id)
    el = wait_for_selector("//span[contains(text(), 'Add Option')]",:xpath)
    el.click
    fill_field('2', 'Doo', :id)
    el = wait_for_selector("//span[contains(text(), 'Add \"Other\"')]",:xpath)
    el.click
    el = wait_for_selector('.create-task__dialog-submit-button')
    el.click
    wait_for_selector('.annotation__task-created')
    expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(true)
    expect(@driver.page_source.include?('Task created by')).to be(true)
    # Answer task
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(false)
    el = wait_for_selector('#Foo')
    el.click
    el = wait_for_selector('#Doo')
    el.click
    el = wait_for_selector('.task__submit')
    el.click
    wait_for_selector('.annotation__task-resolved')
    expect(@driver.page_source.include?('task__answered-by-current-user')).to be(true)
    # Edit task
    expect(@driver.page_source.include?('Task edited by')).to be(false)
    el = wait_for_selector('.task-actions__icon')
    el.click
    editbutton = wait_for_selector('.task-actions__edit')
    editbutton.location_once_scrolled_into_view
    editbutton.click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', '??')
    editbutton = wait_for_selector('.create-task__dialog-submit-button')
    editbutton.click
    wait_for_selector('.annotation__update-task')
    expect(@driver.page_source.include?('Task edited by')).to be(true)
    # Edit task answer
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(false)
    el = wait_for_selector('.task-actions__icon').click
    el = wait_for_selector('.task-actions__edit-response')
    el.click
    el = wait_for_selector('#Doo')
    el.click
    el = wait_for_selector('.task__option_other_text_input')
    el.click
    fill_field('textarea[name="response"]', 'BooYaTribe')
    el = wait_for_selector('.task__submit')
    el.click
    wait_for_selector('.annotation--task_response_multiple_choice')
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(true)
    # Delete task
    delete_task('Foo')
  end

  it "should go from one item to another", bin2: true do
    page = create_media_depending_on_type(nil, 3)
    page.load unless page.nil?
    wait_for_selector('.media__heading').click
    wait_for_selector('.media__notes-heading')

    # First item
    expect(@driver.page_source.include?('1 / 3')).to be(true)
    expect(@driver.page_source.include?('2 / 3')).to be(false)
    expect(@driver.page_source.include?('3 / 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Second item
    wait_for_selector('#media-search__next-item').click
    wait_for_selector('.media__notes-heading')
    expect(@driver.page_source.include?('1 / 3')).to be(false)
    expect(@driver.page_source.include?('2 / 3')).to be(true)
    expect(@driver.page_source.include?('3 / 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Third item
    wait_for_selector('#media-search__next-item').click
    wait_for_selector('.media__notes-heading')
    expect(@driver.page_source.include?('1 / 3')).to be(false)
    expect(@driver.page_source.include?('2 / 3')).to be(false)
    expect(@driver.page_source.include?('3 / 3')).to be(true)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(true)

    # Second item
    wait_for_selector('#media-search__previous-item').click
    wait_for_selector('.media__notes-heading')
    expect(@driver.page_source.include?('1 / 3')).to be(false)
    expect(@driver.page_source.include?('2 / 3')).to be(true)
    expect(@driver.page_source.include?('3 / 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # First item
    wait_for_selector('#media-search__previous-item').click
    wait_for_selector('.media__notes-heading')
    expect(@driver.page_source.include?('1 / 3')).to be(true)
    expect(@driver.page_source.include?('2 / 3')).to be(false)
    expect(@driver.page_source.include?('3 / 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(false)
  end

  it "should update notes count after delete annotation", bin3: true do
    create_media_depending_on_type
    wait_for_selector(".media__annotations-column")
    fill_field('#cmd-input', 'Test')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation--comment')
    notes_count_before = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
    expect(notes_count_before > 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector('.annotation__deleted')
    notes_count_after = wait_for_selector('.media-detail__check-notes-count').text.gsub(/ .*/, '').to_i
    expect(notes_count_after > 0).to be(true)
    expect(notes_count_after == notes_count_before).to be(true) # Count should be the same because the comment is replaced by the "comment deleted" annotation
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it "should set a verification status for one media" , bin1: true do
    create_media_depending_on_type
    wait_for_selector(".media-detail__card-header")
    expect(@driver.page_source.include?('In Progress')).to be(false)
    wait_for_selector(".media-status__label > div button svg").click
    wait_for_selector(".media-status__menu-item")
    wait_for_selector(".media-status__menu-item--in-progress").click
    wait_for_selector_none(".media-status__menu-item")
    expect(@driver.page_source.include?('In Progress')).to be(true)
  end

  it "should change the status to true and manually add new related items" , bin1: true do
    if @config['app_name'] == 'bridge'
      status = '.media-status__menu-item--ready'
      result = 'Translation status set to'
      annotation_class = 'annotation--translation_status'
    else
      status = '.media-status__menu-item--verified'
      result = 'Status set to'
      annotation_class = 'annotation--verification_status'
    end
    create_media_depending_on_type
    wait_for_selector(".media-detail__card-header")
    expect(@driver.page_source.include?(result)).to be(false)
    wait_for_selector(".media-status__label > div button svg").click
    wait_for_selector(".media-status__menu-item")
    wait_for_selector(status).click
    wait_for_selector_none(".media-status__menu-item")
    wait_for_selector(annotation_class, :class)
    expect(@driver.page_source.include?(result)).to be(true)
    expect(@driver.page_source.include?('Related Claim')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Related Claim')
    fill_field('#create-media-quote-attribution-source-input', 'Related Item')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail__card-header", 2)
    expect(@driver.page_source.include?('Related Claim')).to be(true)
  end
end
