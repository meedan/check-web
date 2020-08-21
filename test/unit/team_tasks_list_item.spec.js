import React from 'react';
import { IntlProvider } from 'react-intl';
import ShortTextIcon from '@material-ui/icons/ShortText';
import { mountWithIntl } from './helpers/intl-test';
import TeamTasksListItem from '../../src/app/components/team/TeamTasksListItem';

const task = {
  task_type: 'free_text',
};

describe('<TeamTasksListItem />', () => {
  it('should render icon, label and menu', function() {
    const wrapper = mountWithIntl(
      <TeamTasksListItem
        task={task}
        team={{}}
      />
    );
    expect(wrapper.find('.team-tasks__task-icon').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-tasks__task-label').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-tasks__menu-item-button').hostNodes()).toHaveLength(1);
  });
});
