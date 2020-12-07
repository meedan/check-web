module TagSpecHelpers
  def add_tag(tag_name)
    wait_for_selector('.tag-menu__icon').click
    fill_field('#tag-input__tag-input', tag_name)
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.tag-menu__done').click
    wait_for_selector_none('#tag-input__tag-input')
  end

  def delete_tag(_tag_name)
    wait_for_selector('.tag-menu__icon').click
    wait_for_selector('#tag-input__tag-input')
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.tag-menu__done').click
  end
end
