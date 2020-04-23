import React from 'react';
import IconDelete from 'material-ui/svg-icons/action/delete';
import { mountWithIntl } from './helpers/intl-test';
import TeamInviteCard from '../../src/app/components/team/TeamInviteCard';
import TeamSizeNudge from '../../src/app/components/team/TeamSizeNudge';

import { getStore } from './helpers/intl-test';

describe('<TeamInviteCard />', () => {
  const currentUser = {
    teams: JSON.stringify({
      "alex":{
        "id":1,
        "name":"alex",
        "role":"owner",
        "status":"member"
      },
      "new-team":{
        "id":2,
        "name":"new team",
        "role":"editor",
        "status":"member"
      },
      "team-gets-appended-to-user-with-role":{
        "id":4,
        "name":"team gets appended to user with role",
        "role":"journalist",
        "status":"member"
      },
      "brand-new-team":{
        "id":5,
        "name":"brand new team",
        "role":"contributor",
        "status":"member"
      }
    })
  };
  it('should show team nudge for team owner with reached team size limit', () => {
    getStore().currentUser = currentUser;
    const team = {
      slug: 'alex',
      get_max_number_of_members: 1,
      team_users: { edges: [ 1 ] },
    };
    const teamCard = mountWithIntl(<TeamInviteCard team={team} />);
    expect(teamCard.find(TeamSizeNudge)).toHaveLength(1);
  });

  it('should not show team nudge for team owner with unreached or infinite team size limit', () => {
    getStore().currentUser = currentUser;
    const team1 = {
      slug: 'alex',
      get_max_number_of_members: 0,
      team_users: { edges: [ 1, 2 ] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.find(TeamSizeNudge)).toHaveLength(0);
    const team2 = {
      slug: 'alex',
      get_max_number_of_members: 2,
      team_users: { edges: [ 1 ] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.find(TeamSizeNudge)).toHaveLength(0);
  });

  it('should not show team nudge for non-team owners regardless of limits', () => {
    getStore().currentUser = currentUser;
    const team1 = {
      slug: 'new-team',
      get_max_number_of_members: 0,
      team_users: { edges: [ 1, 2 ] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.find(TeamSizeNudge)).toHaveLength(0);
    const team2 = {
      slug: 'brand-new-team',
      get_max_number_of_members: 1,
      team_users: { edges: [ 1 ] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.find(TeamSizeNudge)).toHaveLength(0);
  });

  it('should show team invite for any team member with unreached or infinite team size limit', () => {
    getStore().currentUser = currentUser;
    const team1 = {
      slug: 'new-team',
      get_max_number_of_members: 0,
      team_users: { edges: [ 1, 2 ] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.html()).toMatch('Invite members');
    const team2 = {
      slug: 'brand-new-team',
      get_max_number_of_members: 2,
      team_users: { edges: [ 1 ] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.html()).toMatch('Invite members');
    const team3 = {
      slug: 'brand-new-team',
      get_max_number_of_members: 1,
      team_users: { edges: [ 1 ] },
    };
    const teamCard3 = mountWithIntl(<TeamInviteCard team={team3} />);
    expect(teamCard3.html()).toEqual('');
  });

  it('should not show anything for any non-team member regardless of limits', () => {
    getStore().currentUser = null;
    const team1 = {
      slug: 'new-team',
      get_max_number_of_members: 0,
      team_users: { edges: [ 1, 2 ] },
    };
    const teamCard1 = mountWithIntl(<TeamInviteCard team={team1} />);
    expect(teamCard1.html()).toEqual('');
    const team2 = {
      slug: 'brand-new-team',
      get_max_number_of_members: 2,
      team_users: { edges: [ 1 ] },
    };
    const teamCard2 = mountWithIntl(<TeamInviteCard team={team2} />);
    expect(teamCard2.html()).toEqual('');
    const team3 = {
      slug: 'brand-new-team',
      get_max_number_of_members: 1,
      team_users: { edges: [ 1 ] },
    };
    const teamCard3 = mountWithIntl(<TeamInviteCard team={team3} />);
    expect(teamCard3.html()).toEqual('');
  });
});
