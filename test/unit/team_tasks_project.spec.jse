import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import TeamTasksProject from '../../src/app/components/team/TeamTasksProject';

const project = {
  teamTasks: [],
};

const projectWithTasks = {
  teamTasks: [
    {
      label: 'Free text task',
      task_type: 'free_text',
    },
    {
      label: 'Datetime task',
      task_type: 'datetime',
    }
  ],
};

describe('<TeamTasksProject />', () => {
  it('should render null if project has no tasks', function() {
    const wrapper = mountWithIntl(
      <TeamTasksProject
        project={project}
      />
    );
    expect(wrapper.html()).toEqual(null);
  });

  it('should render items if project has tasks', function() {
    const wrapper = mountWithIntl(
      <TeamTasksProject
        project={projectWithTasks}
      />
    );
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(2);
  });
});
