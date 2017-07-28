import React from 'react';
import { expect } from 'chai';
import IconMenu from 'material-ui/IconMenu';
import UserMenuRelay from '../../src/app/relay/UserMenuRelay';
import Header from '../../src/app/components/Header';
import TeamHeader from '../../src/app/components/team/TeamHeader';
import TeamPublicHeader from '../../src/app/components/team/TeamPublicHeader';
import { mountWithIntl } from './helpers/intl-test';

describe('<Header />', () => {
  it('renders team header on members page', () => {
    const location = { pathname: '/team/members' };
    const header = mountWithIntl(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(1);
    expect(header.find(TeamPublicHeader)).to.have.length(0);
  });

  // TODO: Refactor so we only use the Relay.QL statement TeamPublicHeader,
  // then use only a single TeamHeader. CGB 2017-7-27
  it('renders public team header on team join page', () => {
    const location = { pathname: '/team/join' };
    const header = mountWithIntl(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(0);
    expect(header.find(TeamPublicHeader)).to.have.length(1);
  });

  it('renders the logo, avatar and menu on the teams page', () => {
    const location = { pathname: '/check/teams' };
    const header = mountWithIntl(<Header location={location} loggedIn params={{}} />);
    console.log(header.debug());
    expect(header.find(TeamHeader)).to.have.length(0);
    expect(header.find(IconMenu)).to.have.length(1);
    expect(header.find(UserMenuRelay)).to.have.length(1);
  });
});
