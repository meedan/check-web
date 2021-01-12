import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import CreateTeamTask from './CreateTeamTask';

describe('<CreateTeamTask />', () => {
  it('should render create task button', () => {
    const wrapper = mountWithIntl(<CreateTeamTask team={{}} />);
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
