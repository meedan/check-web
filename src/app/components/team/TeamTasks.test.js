import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { TeamTasksComponent } from './TeamTasks';

const team = {
  team_tasks: {
    edges: [],
  },
  projects: {
    edges: [],
  },
};

describe('<TeamTasksComponent />', () => {
  it('should render filter and create task button', () => {
    const wrapper = mountWithIntl(<TeamTasksComponent team={team} fieldset="tasks" />);
    expect(wrapper.find('.filter-popup').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
