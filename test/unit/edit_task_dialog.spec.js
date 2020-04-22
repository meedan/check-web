import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import { expect } from 'chai';
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
    expect(wrapper.find('#task-label-input').hostNodes()).to.have.length(1);
    expect(wrapper.find('#task-description-input').hostNodes()).to.have.length(1);
    expect(wrapper.find('#edit-task__required-switch').hostNodes()).to.have.length(1);
    expect(wrapper.find('.create-task__dialog-cancel-button').hostNodes()).to.have.length(1);
    expect(wrapper.find('.create-task__dialog-submit-button').hostNodes()).to.have.length(1);
  });
});
