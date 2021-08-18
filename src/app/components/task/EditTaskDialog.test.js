import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import EditTaskDialog from './EditTaskDialog';

const task = {};
const tasks = [];

describe('<EditTaskDialog />', () => {
  it('should render dialog', () => {
    const wrapper = mountWithIntl(<EditTaskDialog
      task={task}
      tasks={tasks}
      taskType="short_text"
    />);
    expect(wrapper.find('#task-label-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#task-description-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-cancel-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-submit-button').hostNodes()).toHaveLength(1);
  });
});
