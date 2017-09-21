import React from 'react';
import { expect } from 'chai';
import IconMenu from 'material-ui/IconMenu';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
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
    expect(header.find(IconArrowBack)).to.have.length(0);
  });

  it('renders public team header on team join page', () => {
    const location = { pathname: '/team/join' };
    const header = mountWithIntl(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(0);
    expect(header.find(TeamPublicHeader)).to.have.length(1);
    expect(header.find(IconArrowBack)).to.have.length(0);
  });

  it('does not show the avatar or team icon on teams page', () => {
    const location = { pathname: '/check/teams' };
    const header = mountWithIntl(<Header location={location} loggedIn params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(0);
    expect(header.find(IconMenu)).to.have.length(0);
  });
});
