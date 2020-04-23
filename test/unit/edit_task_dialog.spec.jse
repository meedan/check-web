import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import EditTaskDialog from '../../src/app/components/task/EditTaskDialog';

const task = {};

describe('<EditTaskDialog />', function() {
  it('should render dialog', function() {
    const wrapper = mountWithIntl(
      <EditTaskDialog
        task={task}
        taskType={'short_text'}
      />
    );
    expect(wrapper.find('#task-label-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#task-description-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#edit-task__required-switch').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-cancel-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__dialog-submit-button').hostNodes()).toHaveLength(1);
  });
});
