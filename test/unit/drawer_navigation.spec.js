import React from 'react';
import { expect } from 'chai';
import DrawerNavigation from '../../src/app/components/drawer/DrawerNavigation';
import DrawerProjectsRelay from '../../src/app/relay/containers/DrawerProjectsRelay';
import UserMenuItems from '../../src/app/components/UserMenuItems';

import { mountWithIntl } from './helpers/intl-test';

describe('<DrawerNavigation />', () => {
  const privateTeam = {
    name: 'team',
    avatar: 'http://localhost:3000/images/team.png',
    dbid: 1,
    private: true,
    slug: 'team',
  };

  const publicTeam = {
    name: 'team',
    avatar: 'http://localhost:3000/images/team.png',
    dbid: 1,
    private: false,
    slug: 'team',
  };

  it('renders with projects in team context if user is logged in and a member', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigation
        inTeamContext
        loggedIn
        currentUserIsMember
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(DrawerProjectsRelay)).to.have.length(1);
  });

  it('does not render projects if user is logged in but not in a team context', () => {
    const location = { pathname: '/' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigation
        loggedIn
        location={location}
        params={params}
      />,
    );
    expect(header.find(DrawerProjectsRelay)).to.have.length(0);
  });

  it('does not render projects if user is logged in and in team context but not a member', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigation
        inTeamContext
        loggedIn
        currentUserIsMember={false}
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(DrawerProjectsRelay)).to.have.length(0);
  });

  it('renders with projects in team context if user is not logged in and it is a public team', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigation
        inTeamContext
        loggedIn
        currentUserIsMember={false}
        team={publicTeam}
        location={location}
        params={params}
      />,
    );

    expect(header.find(UserMenuItems)).to.have.length(1);
  });

  it('does not render UserMenuItems if user is not logged in', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigation
        inTeamContext
        loggedIn={false}
        currentUserIsMember={false}
        team={publicTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(UserMenuItems)).to.have.length(0);
  });
});
