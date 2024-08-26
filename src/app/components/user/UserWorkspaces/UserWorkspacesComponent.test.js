import React from 'react';
import { UserWorkspacesComponent } from './PaginatedUserWorkspaces';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

const workspaces = [
  {
    dbid: 8,
    name: 'Sixth workspace',
    avatar: 'http://localhost:3000/images/team.png',
    slug: 'sixth-workspace',
    members_count: 2,
    id: 'VGVhbS84\n',
  },
  {
    dbid: 12,
    name: 'tenth workspace',
    avatar: 'http://localhost:3000/images/team.png',
    slug: 'tenth-workspace',
    members_count: 2,
    id: 'VGVhbS8xMg==\n',
  },
  {
    dbid: 13,
    name: 'eleventh! workspace',
    avatar: 'http://localhost:3000/images/team.png',
    slug: 'eleventh-workspace',
    members_count: 2,
    id: 'VGVhbS8xMw==\n',
  },
];

describe('<UserWorkspacesComponent />', () => {
  it('should show a message if the user has no workspaces', () => {
    const wrapper = mountWithIntl(<UserWorkspacesComponent
      currentTeam={null}
      numberOfTeams={0}
      pageSize={10}
      teams={[]}
      totalCount={0}
      user={1}
    />);
    expect(wrapper.find('.no-workspaces').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.teams').hostNodes()).toHaveLength(0);
  });

  it('should show pagination if there are more workspaces than can fit on a single page', () => {
    const wrapper = mountWithIntl(<UserWorkspacesComponent
      currentTeam={8}
      numberOfTeams={3}
      pageSize={2}
      teams={workspaces}
      totalCount={3}
      user={1}
    />);
    expect(wrapper.find('.teams').hostNodes()).toHaveLength(1);
  });
});
