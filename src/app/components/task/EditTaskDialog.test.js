import React from 'react';
import EditTaskDialog from './EditTaskDialog';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const task = {};

describe('<EditTaskDialog />', () => {
  it('should render dialog', () => {
    const wrapper = mountWithIntl(<EditTaskDialog
      task={task}
      taskType="short_text"
    />);
    expect(wrapper.find('#task-label-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-cancel-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-submit-button').hostNodes()).toHaveLength(1);
  });
});
