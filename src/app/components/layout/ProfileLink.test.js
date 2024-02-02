import React from 'react';
import { ProfileLink } from './ProfileLink';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const current_team = {
  dbid: 1,
  name: 'teamName',
  slug: 'slugTeam',
  members_count: 1,
  user: {
    dbid: 1,
    is_active: true,
    name: 'User Name',
  },
};

describe('<ProfileLink />', () => {
  it('should render user name and profile link', () => {
    const wrapper = mountWithIntl(<ProfileLink teamUser={current_team} />);
    expect(wrapper.html()).toMatch('User Name');
    expect(wrapper.find('a').hostNodes()).toHaveLength(1);
  });
});
