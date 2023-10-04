module TagSpecHelpers
  def add_tag(tag_name)
    wait_for_selector('.tag-menu__icon').click
    fill_field('.int-multiselector__search--input input', tag_name)
    wait_for_selector('#tag-menu__create-button').click
    wait_for_selector_none('.int-multiselector__search--input')
  end

  def add_team_tag(tag_name)
    wait_for_selector('#team-tags__create').click
    wait_for_selector('#confirm-dialog__confirm-action-button')
    fill_field('#team-tags__name-input', tag_name)
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
  end

  def delete_tag(_tag_name)
    wait_for_selector('.tag-menu__icon').click
    wait_for_selector('.int-multiselector__search--input input')
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.int-multiselector__button--save').click
  end
end
