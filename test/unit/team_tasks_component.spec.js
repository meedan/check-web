import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import { expect } from 'chai';
import { TeamTasksComponent } from '../../src/app/components/team/TeamTasks';

const team = {
  team_tasks: {
    edges: [],
  },
  projects: {
    edges: [],
  },
};

const direction = {
  from: 'left',
  to: 'right',
};

describe('<TeamTasksComponent />', () => {
  it('should render filter and create task button', function() {
    const wrapper = mountWithIntl(
      <TeamTasksComponent team={team} direction={direction} />
    );
    expect(wrapper.find('.filter-popup').hostNodes()).to.have.length(1);
    expect(wrapper.find('.create-task__add-button').hostNodes()).to.have.length(1);
    expect(wrapper.html()).to.contain('Tasks');
  });
});
