import React from 'react';
import { mountWithIntl, getStore } from '../../../../test/unit/helpers/intl-test';
import { TeamComponentTest } from './TeamComponent';

describe('<TeamComponent />', () => {
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

  it('Should not render report tab or data tab when smooch is not installed on the team', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/settings/',
      },
    });
    getStore().currentUser = currentUser;
    getStore().team = team;
    const wrapper = mountWithIntl(<TeamComponentTest
      team={team}
      params={{}}
      route={{ action: 'settings' }}
    />);
    expect(wrapper.find('.team-settings__report-tab').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.team-settings__data-tab').hostNodes()).toHaveLength(0);
  });

  it('Should render report tab and data tab when smooch is installed on the team', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/settings/',
      },
    });
    getStore().currentUser = currentUser;
    getStore().team = team;
    const wrapper = mountWithIntl(<TeamComponentTest
      team={team2}
      params={{}}
      route={{ action: 'settings' }}
    />);
    expect(wrapper.find('.team-settings__report-tab').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-settings__data-tab').hostNodes()).toHaveLength(1);
  });
});
