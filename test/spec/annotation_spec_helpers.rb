module AnnotationSpecHelpers
  def create_annotation(params = {})
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('#task-label-input').send_keys(params[:task_name])
    @driver.action.send_keys(:tab).perform
    @driver.action.send_keys(:tab).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector(params[:task_type_class]).click
    if params[:value1]
      wait_for_selector('input[placeholder="Value 1"').send_keys(params[:value1])
      wait_for_selector('input[placeholder="Value 2"').send_keys(params[:value2])
    end
    if params[:add_options]
      wait_for_selector("//span[contains(text(), 'Add Option')]", :xpath).click
      wait_for_selector('input[placeholder="Value 3"').send_keys(params[:value3])
    end
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none('.create-task__dialog-cancel-button')
  end

  def edit_annotation(new_annotation, field_type = nil)
    wait_for_selector('.create-task__add-button')
    wait_for_selector('.team-tasks__menu-item-button').click
    wait_for_selector('.team-tasks__edit-button').click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    if field_type
      wait_for_selector('.MuiSelect-selectMenu').click
      wait_for_selector(new_annotation).click
    else
      update_field('#task-label-input', new_annotation)
    end
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none('.create-task__dialog-submit-button')
  end

  def delete_annotation
    wait_for_selector('.team-tasks__menu-item-button').click
    wait_for_selector('.team-tasks__edit-button')
    wait_for_selector('.team-tasks__delete-button').click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector_none("//span[contains(text(), 'Cancel')]", :xpath)
  end

  def answer_annotation(params = {})
    if params[:task_type_class] == '.edit-task-dialog__menu-item-single_choice' || params[:task_type_class] == '.edit-task-dialog__menu-item-multiple_choice'
      wait_for_selector(params[:choice], :id).click
      wait_for_selector(params[:choice_two], :id).click if params[:choice_two]
      wait_for_selector('.task__submit').click
    else
      fill_field(params[:selector], params[:response])
      update_field(params[:selector_two], params[:response_two]) if params[:selector_two]
      wait_for_selector('.task__save').click
    end
  end
end
