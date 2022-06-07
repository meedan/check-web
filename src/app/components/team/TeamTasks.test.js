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

const about = {
  file_max_size: '1000',
  file_extensions: ['png'],
};

describe('<TeamTasksComponent />', () => {
  it('should render filter and create task button', () => {
    const wrapper = mountWithIntl(<TeamTasksComponent team={team} about={about} fieldset="metadata" />);
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
