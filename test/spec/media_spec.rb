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

  it "should edit a media title and description", bin4: true do
    create_media_depending_on_type
    wait_for_selector('.media-detail')
    expect(@driver.page_source.include?('Edited media description')).to be(false)
    expect(@driver.page_source.include?('Edited media title')).to be(false)
    wait_for_selector(".media-actions__icon").click
    wait_for_selector(".media-actions__edit").click
    wait_for_selector("form")
    fill_field(".media-detail__title-input > input","Edited media title")
    fill_field(".media-detail__description-input > div > textarea + textarea","Edited media description")
    wait_for_selector(".media-detail__save-edits").click
    wait_for_selector_none("form")
    expect(@driver.page_source.include?('Edited media title')).to be(true)
    wait_for_selector(".project-header__back-button").click
    wait_for_selector(".medias__item")
    expect(@driver.page_source.include?('Edited media description')).to be(true)
  end

  it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
    page = create_media_depending_on_type
    wait_for_selector(".media-detail")
    new_tag = 'tag:'+Time.now.to_i.to_s
    # Validate assumption that tag does not exist
    expect(page.has_tag?(new_tag)).to be(false)
    # Add tag
    page.add_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(true)
    # Try to add duplicate
    wait_for_selector(".tag-menu__icon").click
    fill_field('#tag-input__tag-input', new_tag)
    @driver.action.send_keys(:enter).perform
    @wait.until { (@driver.page_source.include?('Validation failed: Tag already exists')) }
    wait_for_selector(".tag-menu__done").click
    # Verify that tag is not added and that error message is displayed
    expect(page.tags.count(new_tag)).to be(1)
    page.delete_tag(new_tag)
    expect(page.has_tag?(new_tag)).to be(false)
  end

  it "should add, edit, answer, update answer and delete short answer task", bin3: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')

    # Create a task
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)

    wait_for_selector('.create-task__add-button').click
    wait_for_selector('.create-task__add-short-answer').click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo or bar?')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none('#task-label-input')
    wait_for_selector('.task-type__free_text')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)

    # Answer task
    expect(@driver.page_source.include?('Resolved by')).to be(false)
    wait_for_selector('.task-type__free_text > div > div > button').click

    wait_for_selector(".task__response-input > div > textarea + textarea")
    fill_field('.task__response-input > div > textarea + textarea', 'Foo')
    @driver.find_element(:css, '.task__save').click
    wait_for_selector('.task__response')
    expect(@driver.page_source.include?('Resolved by')).to be(true)

    # Edit task
    expect(@driver.page_source.include?('Foo or bar???')).to be(false)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit').click
    wait_for_selector("#task-description-input")
    fill_field('#task-label-input', '??')
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none("#task-description-input")
    expect(@driver.page_source.include?('Foo or bar???')).to be(true)

    # Edit task answer
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit-response').click
    # Ensure menu closes and textarea is focused...
    wait_for_selector('textarea[name="response"]', :css).click
    wait_for_selector(".task__cancel")
    fill_field('.task__response-input > div > textarea + textarea', ' edited')
    @driver.find_element(:css, '.task__save').click
    wait_for_selector_none(".task__cancel")
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('Foo edited')).to be(true)

    # Delete task
    delete_task('Foo')
  end

  it "should add, edit, answer, update answer and delete single_choice task", bin2: true  do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')
    # Create a task
    expect(@driver.page_source.include?('Foo or bar?')).to be(false)
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('.create-task__add-choose-one').click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo or bar?')
    fill_field('0', 'Foo', :id)
    fill_field('1', 'Bar', :id)
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector('.task-type__single_choice')
    expect(@driver.page_source.include?('Foo or bar?')).to be(true)
    # Answer task
    wait_for_selector('.task-type__single_choice > div > div > button').click
    wait_for_selector('0', :id).click
    wait_for_selector('.task__submit').click
    wait_for_selector("#user__avatars")
    expect(@driver.page_source.include?('Resolved by')).to be(true)
    # Edit task
    expect(@driver.page_source.include?('??')).to be(false)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit').click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', '??')
    wait_for_selector('.create-task__dialog-submit-button').click
    expect(@driver.page_source.include?('??')).to be(true)
    # Edit task answer
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit-response').click
    wait_for_selector('1', :id).click
    wait_for_selector('.task__submit').click
    wait_for_selector_none('.task__submit')
    # Delete task
    delete_task('Foo')
  end

  it "should add, edit, answer, update answer and delete multiple_choice task", bin5: true do
    media_pg = create_media_depending_on_type
    wait_for_selector('.create-task__add-button')
    # Create a task
    expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(false)
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('.create-task__add-choose-multiple').click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', 'Foo, Doo or bar?')
    fill_field('0', 'Foo', :id)
    fill_field('1', 'Bar', :id)
    wait_for_selector("//span[contains(text(), 'Add Option')]",:xpath).click
    fill_field('2', 'Doo', :id)
    wait_for_selector("//span[contains(text(), 'Add \"Other\"')]",:xpath).click
    wait_for_selector('.create-task__dialog-submit-button').click
    expect(@driver.page_source.include?('Foo, Doo or bar?')).to be(true)
    # Answer task
    expect(@driver.page_source.include?('Resolved by')).to be(false)
    wait_for_selector('.task-type__multiple_choice > div > div > button').click
    wait_for_selector('#Foo').click
    wait_for_selector('#Doo').click
    wait_for_selector('.task__submit').click
    wait_for_selector("#user__avatars")
    expect(@driver.page_source.include?('Resolved by')).to be(true)
    # Edit task
    expect(@driver.page_source.include?('??')).to be(false)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit').click
    wait_for_selector('#task-label-input')
    fill_field('#task-label-input', '??')
    wait_for_selector('.create-task__dialog-submit-button').click
    expect(@driver.page_source.include?('??')).to be(true)

    # Edit task answer
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(false)
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit-response').click
    wait_for_selector('#Doo').click
    wait_for_selector('.task__option_other_text_input').click
    fill_field('textarea[name="response"]', 'BooYaTribe')
    wait_for_selector('.task__submit').click
    wait_for_selector_none('.task__submit')
    expect(@driver.page_source.gsub(/<\/?[^>]*>/, '').include?('BooYaTribe')).to be(true)
    # Delete task
    delete_task('Foo')
  end

  it "should go from one item to another", bin2: true do
    page = create_media_depending_on_type(nil, 3)
    page.load unless page.nil?
    wait_for_selector(".medias__item")
    wait_for_selector('.media__heading').click
    wait_for_selector('.media-search__actions-bar')

    # First item
    expect(@driver.page_source.include?('1 of 3')).to be(true)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Second item
    wait_for_selector('#media-search__next-item').click
    wait_for_selector('.media-search__actions-bar')
    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(true)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # Third item
    wait_for_selector('#media-search__next-item').click
    wait_for_selector('.media-search__actions-bar')

    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(true)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(true)

    # Second item
    wait_for_selector('#media-search__previous-item').click
    wait_for_selector('.media-search__actions-bar')
    expect(@driver.page_source.include?('1 of 3')).to be(false)
    expect(@driver.page_source.include?('2 of 3')).to be(true)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(false)
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)

    # First item
    wait_for_selector('#media-search__previous-item').click
    wait_for_selector('.media-search__actions-bar')
    expect(@driver.page_source.include?('1 of 3')).to be(true)
    expect(@driver.page_source.include?('2 of 3')).to be(false)
    expect(@driver.page_source.include?('3 of 3')).to be(false)
    expect(@driver.page_source.include?('Claim 2')).to be(true)
    expect(@driver.page_source.include?('Claim 1')).to be(false)
    expect(@driver.page_source.include?('Claim 0')).to be(false)
  end

  it "should update notes count after delete annotation", bin3: true do
    create_media_depending_on_type
    wait_for_selector(".media-tab__comments").click
    wait_for_selector(".annotations__list")
    fill_field('#cmd-input', 'Comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation__avatar-col')
    wait_for_selector(".media-tab__activity").click
    notes_count_before = wait_for_selector_list('.annotation__timestamp').length
    expect(notes_count_before == 0).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(false)
    wait_for_selector(".media-tab__comments").click
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    wait_for_selector(".media-tab__activity").click
    notes_count_after = wait_for_selector_list('.annotation__timestamp').length
    expect(notes_count_after > notes_count_before).to be(true)
    expect(@driver.page_source.include?('Comment deleted')).to be(true)
  end

  it "should change the status to true and manually add new related items" , bin1: true do
    create_media_depending_on_type
    wait_for_selector(".media-detail")
    expect(@driver.page_source.include?('Verified')).to be(false)
    change_the_status_to('.media-status__menu-item--verified', false)
    expect(@driver.page_source.include?('verified')).to be(true)
    expect(@driver.page_source.include?('Related Claim')).to be(false)
    press_button('.create-related-media__add-button')
    wait_for_selector('#create-media__quote').click
    wait_for_selector("#create-media-quote-input")
    fill_field('#create-media-quote-input', 'Related Claim')
    fill_field('#create-media-quote-attribution-source-input', 'Related Item')
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-quote-input")
    wait_for_selector_list_size(".media-detail", 2)
    expect(@driver.page_source.include?('Related Claim')).to be(true)
  end
end
