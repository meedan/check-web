import React from 'react';
import { mountWithIntl, getStore } from '../../../../test/unit/helpers/intl-test';
import TeamInviteCard from './TeamInviteCard';

describe('<TeamInviteCard />', () => {
  const currentUser = {
    teams: JSON.stringify({
      alex: {
        id: 1,
        name: 'alex',
        role: 'owner',
        status: 'member',
      },
      'new-team': {
        id: 2,
        name: 'new team',
        role: 'editor',
        status: 'member',
      },
      'team-gets-appended-to-user-with-role': {
        id: 4,
        name: 'team gets appended to user with role',
        role: 'journalist',
        status: 'member',
      },
      'brand-new-team': {
        id: 5,
        name: 'brand new team',
        role: 'contributor',
        status: 'member',
      },
    }),
  };
  it('should show team invite for any team member', () => {
    getStore().currentUser = currentUser;
    const team1 = {
      slug: 'new-team',
      team_users: { edges: [1, 2] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.html()).toMatch('Invite members');
    const team2 = {
      slug: 'brand-new-team',
      team_users: { edges: [1] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.html()).toMatch('Invite members');
  });

  it('should not show anything for any non-team member', () => {
    getStore().currentUser = null;
    const team1 = {
      slug: 'new-team',
      team_users: { edges: [1, 2] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.html()).toEqual('');
    const team2 = {
      slug: 'brand-new-team',
      team_users: { edges: [1] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.html()).toEqual('');
    const team3 = {
      slug: 'brand-new-team',
      team_users: { edges: [1] },
    };
    const teamCard3 = mountWithIntl(<TeamInviteCard team={team3} />);
    expect(teamCard3.html()).toEqual('');
  });
});
