import React from 'react';
import DrawerNavigationComponent from './DrawerNavigationComponent';
import DrawerProjects from './drawer/Projects';
import UserMenuItems from './UserMenuItems';

import { mountWithIntl, getStore } from '../../../test/unit/helpers/intl-test';

describe('<DrawerNavigationComponent />', () => {
  const currentUser = {
    teams: '{"alex":{"id":1,"name":"alex","role":"owner","status":"member"},"new-team":{"id":2,"name":"new team","role":"owner","status":"member"},"team-gets-appended-to-user-with-role":{"id":4,"name":"team gets appended to user with role","role":"owner","status":"member"},"brand-new-team":{"id":5,"name":"brand new team","role":"owner","status":"member"}}',
  };

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
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/members/',
      },
    });
    const params = { team: 'team' };
    getStore().currentUser = currentUser;
    getStore().team = privateTeam;
    getStore().dispatch = () => {};
    const pusher = { subscribe: jest.fn(() => ({ bind: jest.fn() })), unsubscribe: jest.fn() };
    const header = mountWithIntl(<DrawerNavigationComponent
      inTeamContext
      loggedIn
      currentUserIsMember
      team={privateTeam}
      pusher={pusher}
      clientSessionId="checkClientSessionId"
      params={params}
      classes={{ paper: 'check-paper' }}
    />);
    expect(header.find(DrawerProjects)).toHaveLength(1);
  });

  it('does not render projects if user is logged in but not in a team context', () => {
    const location = { pathname: '/' };
    const params = { team: 'team' };
    const pusher = { subscribe: jest.fn(() => ({ bind: jest.fn() })), unsubscribe: jest.fn() };
    getStore().currentUser = currentUser;
    const header = mountWithIntl(<DrawerNavigationComponent
      loggedIn
      location={location}
      params={params}
      classes={{ paper: 'check-paper' }}
      pusher={pusher}
      clientSessionId="checkClientSessionId"
      currentUserIsMember={false}
    />);
    expect(header.find(DrawerProjects)).toHaveLength(0);
  });

  it('does not render projects if user is logged in and in team context but not a member', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const pusher = { subscribe: jest.fn(() => ({ bind: jest.fn() })), unsubscribe: jest.fn() };
    getStore().currentUser = currentUser;
    getStore().team = privateTeam;
    getStore().dispatch = () => {};
    const header = mountWithIntl(<DrawerNavigationComponent
      inTeamContext
      loggedIn
      currentUserIsMember={false}
      team={privateTeam}
      location={location}
      params={params}
      classes={{ paper: 'check-paper' }}
      pusher={pusher}
      clientSessionId="checkClientSessionId"
    />);
    expect(header.find(DrawerProjects)).toHaveLength(0);
  });

  it('renders with projects in team context if user is not logged in and it is a public team', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/members/',
      },
    });
    const params = { team: 'team' };
    const pusher = { subscribe: jest.fn(() => ({ bind: jest.fn() })), unsubscribe: jest.fn() };
    getStore().currentUser = undefined;
    getStore().team = publicTeam;
    getStore().dispatch = () => {};
    const header = mountWithIntl(<DrawerNavigationComponent
      inTeamContext
      loggedIn={false}
      currentUserIsMember={false}
      team={publicTeam}
      pusher={pusher}
      clientSessionId="checkClientSessionId"
      params={params}
      classes={{ paper: 'check-paper' }}
    />);

    expect(header.find(DrawerProjects)).toHaveLength(1);
  });

  it('does not render UserMenuItems if user is not logged in', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/members/',
      },
    });
    const params = { team: 'team' };
    const pusher = { subscribe: jest.fn(() => ({ bind: jest.fn() })), unsubscribe: jest.fn() };
    getStore().currentUser = currentUser;
    getStore().team = publicTeam;
    getStore().dispatch = () => {};
    const header = mountWithIntl(<DrawerNavigationComponent
      inTeamContext
      loggedIn={false}
      currentUserIsMember={false}
      team={publicTeam}
      params={params}
      classes={{ paper: 'check-paper' }}
      pusher={pusher}
      clientSessionId="checkClientSessionId"
    />);
    expect(header.find(UserMenuItems)).toHaveLength(0);
  });
});
