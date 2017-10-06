import React from 'react';
import { expect } from 'chai';
import DrawerNavigationComponent from '../../src/app/components/DrawerNavigationComponent';
import Projects from '../../src/app/components/drawer/Projects';
import UserMenuItems from '../../src/app/components/UserMenuItems';

import { mountWithIntl } from './helpers/intl-test';

describe('<DrawerNavigationComponent />', () => {
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
      <DrawerNavigationComponent
        inTeamContext
        loggedIn
        currentUserIsMember
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(Projects)).to.have.length(1);
  });

  it('does not render projects if user is logged in but not in a team context', () => {
    const location = { pathname: '/' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigationComponent
        loggedIn
        location={location}
        params={params}
      />,
    );
    expect(header.find(Projects)).to.have.length(0);
  });

  it('does not render projects if user is logged in and in team context but not a member', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigationComponent
        inTeamContext
        loggedIn
        currentUserIsMember={false}
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(Projects)).to.have.length(0);
  });

  it('renders with projects in team context if user is not logged in and it is a public team', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <DrawerNavigationComponent
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
      <DrawerNavigationComponent
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
