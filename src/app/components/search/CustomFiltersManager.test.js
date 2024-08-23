import React from 'react';
import { CustomFiltersManagerTest } from './CustomFiltersManager';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<CustomFiltersManager />', () => {
  const team = {
    team_tasks: {
      edges: [{
        node: {
          dbid: 123,
          type: 'free_text',
        },
      }, {
        node: {
          dbid: 456,
          type: 'single_choice',
        },
      }],
    },
  };

  it('should render a MultiSelectFilter for each team task', () => {
    const query = {
      team_tasks: [
        { id: '123', task_type: 'free_text' },
        { id: '456', task_type: 'single_choice' },
      ],
    };

    const wrapper = mountWithIntl(<CustomFiltersManagerTest
      query={query}
      team={team}
      onFilterChange={() => {}}
    />);

    expect(wrapper.find('#free_text-123')).toHaveLength(1);
    expect(wrapper.find('#single_choice-456')).toHaveLength(1);
  });

  it('should not error if team task not found', () => {
    const query = {
      team_tasks: [
        { id: '0', task_type: 'invalid_task' },
      ],
    };

    const wrapper = mountWithIntl(<CustomFiltersManagerTest
      query={query}
      team={team}
      onFilterChange={() => {}}
    />);

    expect(wrapper.find('#invalid_task-0')).toHaveLength(0);
  });
});
