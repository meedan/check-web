import React from 'react';
import CreateTeamTask from './CreateTeamTask';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<CreateTeamTask />', () => {
  it('should render create task button', () => {
    const wrapper = mountWithIntl(<CreateTeamTask team={{}} associatedType="ProjectMedia" />);
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
