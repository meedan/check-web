import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import TeamTasksListItem from './TeamTasksListItem';

const task = {
  type: 'free_text',
  id: '1',
  label: 'label',
};

const team = {
  id: '1',
};

describe('<TeamTasksListItem />', () => {
  it('should render icon, label and menu', () => {
    const wrapper = mountWithIntl(<TeamTasksListItem
      task={task}
      team={team}
      fieldset=""
    />);
    expect(wrapper.find('.team-tasks__task-icon').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-tasks__task-label').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-tasks__menu-item-button').hostNodes()).toHaveLength(1);
  });
});
