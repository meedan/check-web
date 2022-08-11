import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { UserTooltipComponent } from './UserTooltip';

describe('<UserTooltipComponent />', () => {
  const teamUser = {
    user: {
      dbid: '2',
      name: 'User Name',
      source: {
        image: 'path/to/image',
      },
    },
  };

  it('should render UserTooltipComponent', () => {
    const wrapper = mountWithIntl(<UserTooltipComponent
      teamUser={teamUser}
    />);
    expect(wrapper.find('.tooltip__profile-link').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('User Name');
  });
});
