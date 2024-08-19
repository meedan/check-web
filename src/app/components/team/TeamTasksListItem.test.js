import React from 'react';
import TeamTasksListItem from './TeamTasksListItem';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const task = {
  type: 'free_text',
  id: '1',
  label: 'label',
};

const team = {
  id: '1',
};

const about = {
  file_max_size: '1000',
  file_extensions: ['png'],
};

describe('<TeamTasksListItem />', () => {
  it('should render component', () => {
    const wrapper = mountWithIntl(<TeamTasksListItem
      about={about}
      index={0}
      task={task}
      tasks={[]}
      team={team}
    />);
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(1);
  });
});
