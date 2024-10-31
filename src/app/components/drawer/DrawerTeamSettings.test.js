import React from 'react';
import { DrawerTeamSettingsComponent } from './DrawerTeamSettings';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<DrawerTeamSettings />', () => {
  const permissions = JSON.stringify({ 'update Team': true, 'read Team': true });

  const currentUser = {
    teams: '{"user test":{"id":1,"name":"user test","role":"admin","status":"member"},"team":{"id":2,"name":"team","role":"admin","status":"member"}}',
  };

  const team = {
    name: 'team',
    avatar: 'http://localhost:3000/images/team.png',
    dbid: 1,
    slug: 'team',
    permissions,
  };

  const team2 = {
    name: 'team',
    avatar: 'http://localhost:3000/images/team.png',
    dbid: 2,
    slug: 'team',
    permissions,
    smooch_bot: {
      id: '1',
    },
  };

  const windowSpy = jest.spyOn(window, 'window', 'get');
  windowSpy.mockImplementation(() => ({
    Check: {
      store: {
        getState: () => ({ app: { context: { currentUser } } }),
      },
      location: {
        pathname: '/settings/workspace/',
      },
    },
  }));

  it('should not render report tab when smooch is not installed on the team', () => {
    const wrapper = shallowWithIntl(<DrawerTeamSettingsComponent
      params={{ tab: '' }}
      team={team}
    />);
    expect(wrapper.find('.team-settings__report-tab')).toHaveLength(0);
  });

  it('should render report tab when smooch is installed on the team', () => {
    const wrapper = shallowWithIntl(<DrawerTeamSettingsComponent
      params={{ tab: 'report' }}
      team={team2}
    />);
    expect(wrapper.find('.team-settings__report-tab')).toHaveLength(1);
  });
});
