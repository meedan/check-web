module TaskSpecHelpers
  def create_task(params = {})
    wait_for_selector('.create-task__add-button').click
    wait_for_selector('#task-label-input').send_keys(params[:task_name])
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

  def edit_task(new_task_name)
    wait_for_selector('.create-task__add-button')
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit').click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    update_field('#task-label-input', new_task_name)
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector_none("//span[contains(text(), 'Cancel')]", :xpath)
  end

  def add_task_comment(comment)
    wait_for_selector('.task__log-icon > svg').click
    wait_for_selector('.add-annotation__insert-photo')
    fill_field('#cmd-input', comment)
    @driver.action.send_keys(:enter).perform
    wait_for_selector("//span[contains(text(), 'Completed by')]", :xpath)
  end

  def assign_task
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__assign').click
    wait_for_selector('#attribution')
    wait_for_selector('.Select-input input').send_keys('user')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.attribution-dialog__save').click
    wait_for_selector('.task__assigned')
  end

  def delete_task
    wait_for_selector('.task')
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__delete').click
    wait_for_selector('.confirm-proceed-dialog__proceed').click
    wait_for_selector_none('.confirm-proceed-dialog__cancel')
  end

  def answer_task(params = {})
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

  def edit_task_response(params = {})
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__edit-response').click
    answer_task(params)
    wait_for_selector_none('.task__cancel')
  end

  def delete_task_response
    wait_for_selector('.task-actions__icon').click
    wait_for_selector('.task-actions__delete-response').click
    wait_for_selector('.confirm-proceed-dialog__proceed').click
    wait_for_selector_none('.confirm-proceed-dialog__cancel')
  end
end
