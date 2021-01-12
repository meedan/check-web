import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import TeamTasksProject from './TeamTasksProject';

const project = {
  teamTasks: [],
};

const projectWithTasks = {
  teamTasks: [
    {
      id: '#$@nTR',
      label: 'Free text task',
      task_type: 'free_text',
    },
    {
      id: 'H&&Ḧsd',
      label: 'Datetime task',
      task_type: 'datetime',
    },
  ],
};

const team = {};

describe('<TeamTasksProject />', () => {
  it('should render null if project has no tasks', () => {
    const wrapper = mountWithIntl(<TeamTasksProject
      project={project}
      team={team}
    />);
    expect(wrapper.html()).toEqual(null);
  });

  it('should render items if project has tasks', () => {
    const wrapper = mountWithIntl(<TeamTasksProject
      project={projectWithTasks}
      team={team}
    />);
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(2);
  });
});
