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
      type: 'free_text',
    },
    {
      id: 'H&&Ḧsd',
      label: 'Datetime task',
      type: 'datetime',
    },
  ],
};

const about = {
  file_max_size: '1000',
  file_extensions: ['png'],
};

const team = { id: '1' };

describe('<TeamTasksProject />', () => {
  it('should render null if project has no tasks', () => {
    const wrapper = mountWithIntl(<TeamTasksProject
      project={project}
      team={team}
      about={about}
    />);
    expect(wrapper.html()).toEqual(null);
  });

  it('should render items if project has tasks', () => {
    const wrapper = mountWithIntl(<TeamTasksProject
      project={projectWithTasks}
      team={team}
      about={about}
    />);
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(2);
  });
});
