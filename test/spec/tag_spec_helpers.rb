module TagSpecHelpers
  def add_tag(tag_name)
    wait_for_selector('.tag-menu__icon').click
    fill_field('#tag-input__tag-input', tag_name)
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.tag-menu__done').click
    wait_for_selector_none('#tag-input__tag-input')
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
    wait_for_selector('#tag-input__tag-input')
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.tag-menu__done').click
  end
end
