import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import { TeamTasksComponent } from '../../src/app/components/team/TeamTasks';

const team = {
  team_tasks: {
    edges: [],
  },
  projects: {
    edges: [],
  },
};

describe('<TeamTasksComponent />', () => {
  it('should render filter and create task button', function() {
    const wrapper = mountWithIntl(
      <TeamTasksComponent team={team} fieldset="tasks" />
    );
    expect(wrapper.find('.filter-popup').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
