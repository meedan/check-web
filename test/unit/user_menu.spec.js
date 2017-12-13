import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import UserMenu from '../../src/app/components/user/UserMenu';

describe('<UserMenu />', () => {
  it('should not render if not signed in', () => {
    const userMenu = mountWithIntl(<UserMenu />);
    expect(userMenu.find('.header__user-menu')).to.have.length(0);
  });

  it('should render if signed in', () => {
    const userMenu = mountWithIntl(<UserMenu loggedIn />);
    expect(userMenu.find('.header__user-menu')).to.have.length(1);
  });
});
