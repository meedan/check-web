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

const about = {
  file_max_size: '1000',
  file_extensions: ['png'],
};

describe('<TeamTasksListItem />', () => {
  it('should render component', () => {
    const wrapper = mountWithIntl(<TeamTasksListItem
      index={0}
      task={task}
      tasks={[]}
      team={team}
      about={about}
    />);
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(1);
  });
});
