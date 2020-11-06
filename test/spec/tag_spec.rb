shared_examples 'tag' do

  it "should manage and search team tags", bin6: true do
    # Create team and go to team page that should not contain any tag
    team = "tag-team-#{Time.now.to_i}"
    api_create_team(team: team)
    @driver.navigate.to @config['self_url'] + '/' + team
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__tasks-tab')
    wait_for_selector('.team-settings__tags-tab').click
    wait_for_selector_none("team-tasks")
    expect(@driver.page_source.include?('No tags')).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(false)

    # Create tag
    fill_field('#tag__new', 'newtag')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-newtag")
    expect(@driver.page_source.include?('No tags')).to be(false)
    expect(@driver.page_source.include?('1 tag')).to be(true)
    expect(@driver.page_source.include?('newtag')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(false)

    # Edit tag
    wait_for_selector('.tag__actions').click
    wait_for_selector(".tag__delete")
    wait_for_selector('.tag__edit').click
    wait_for_selector("#tag__edit")
    fill_field('#tag__edit', 'edited')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-newtagedited")
    expect(@driver.page_source.include?('1 tag')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(true)

    # Create another tag
    fill_field('#tag__new', 'tag2')
    @driver.action.send_keys(:enter).perform
    wait_for_selector("#tag__text-tag2")
    expect(@driver.page_source.include?('tag2')).to be(true)

    # Search tag by keyword
    wait_for_selector(".filter-popup > div > button > span > svg").click
    wait_for_selector("input[name=sort-select]")
    wait_for_selector("input[placeholder='Search…']").send_keys("edited")
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//span[contains(text(), 'Done')]", :xpath).click
    expect(@driver.page_source.include?('newtagedited')).to be(true)
    expect(@driver.page_source.include?('tag2')).to be(false)

    # Delete tag
    wait_for_selector('.tag__actions').click
    wait_for_selector('.tag__edit')
    wait_for_selector('.tag__delete').click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#tag__confirm')
    wait_for_selector_none("#tag__text-newtagedited")
    expect(@driver.page_source.include?('No tags')).to be(true)
    expect(@driver.page_source.include?('newtagedited')).to be(false)
  end

  it "should add a tag, reject duplicated and delete tag", bin3: true, quick: true  do
    create_media_depending_on_type
    wait_for_selector(".media-detail")
    new_tag = 'tag:'+Time.now.to_i.to_s
    # Validate assumption that tag does not exist
    expect(@driver.page_source.include?(new_tag)).to be(false)
    # Add tag
    add_tag(new_tag)
    @wait.until { (@driver.page_source.include?(new_tag)) }
    # Try to add duplicate
    wait_for_selector(".tag-menu__icon").click
    fill_field('#tag-input__tag-input', new_tag)
    @driver.action.send_keys(:enter).perform
    @wait.until { (@driver.page_source.include?('Tag already exists')) }
    wait_for_selector(".tag-menu__done").click
    # Verify that tag is not added and that error message is displayed
    wait_for_selector_none("#tag-input__tag-input")
    expect(@driver.find_elements(:class, "media-tags__tag").length).to eq 1
    delete_tag(new_tag)
    wait_for_selector_none(".media-tags__tag")
    expect(@driver.find_elements(:class, "media-tags__tag").length).to eq 0
  end
end