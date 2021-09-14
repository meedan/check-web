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
  it('should render component', () => {
    const wrapper = mountWithIntl(<TeamTasksListItem
      index={0}
      fieldset=""
      task={task}
      tasks={[]}
      team={team}
    />);
    expect(wrapper.find('.team-tasks__list-item').hostNodes()).toHaveLength(1);
  });
});
