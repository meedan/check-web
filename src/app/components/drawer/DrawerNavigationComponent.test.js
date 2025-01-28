import React from 'react';
import DrawerNavigationComponent from './DrawerNavigationComponent';
import { mountWithIntl, getStore } from '../../../../test/unit/helpers/intl-test';
import DrawerProjects from '.';


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
      clientSessionId="checkClientSessionId"
      currentUserIsMember
      inTeamContext
      loggedIn
      params={params}
      pusher={pusher}
      team={privateTeam}
    />);
    expect(header.find(DrawerProjects)).toHaveLength(1);
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
      clientSessionId="checkClientSessionId"
      currentUserIsMember={false}
      inTeamContext
      loggedIn={false}
      params={params}
      pusher={pusher}
      team={publicTeam}
    />);

    expect(header.find(DrawerProjects)).toHaveLength(1);
  });
});
