import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import CreateTeamTask from '../../src/app/components/team/CreateTeamTask';

describe('<CreateTeamTask />', () => {
  it('should render create task button', function() {
    const wrapper = mountWithIntl(
      <CreateTeamTask team={{}} />
    );
    expect(wrapper.find('.create-task__add-button').hostNodes()).toHaveLength(1);
  });
});
