import React from 'react';
import ProfileLink from './ProfileLink';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

const user = {
  dbid: 1,
  is_active: true,
  name: 'User Name',
};

describe('<ProfileLink />', () => {
  it('should render user name and profile link', () => {
    const wrapper = mountWithIntlProvider(<ProfileLink user={user} />);
    expect(wrapper.html()).toMatch('User Name');
    expect(wrapper.find('a').hostNodes()).toHaveLength(1);
  });
});
