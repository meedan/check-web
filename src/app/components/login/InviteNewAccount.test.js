import React from 'react';
import { InviteNewAccountComponent } from './InviteNewAccount';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';


const team = {
  id: '2',
  name: 'Test Team A',
  slug: 'team',
  members_count: 1,
  project_groups: { edges: [{ node: { project_group_id: '1', title: 'title' } }] },
};

const user = {
  teams: team,
  team_user: {
    team: {
      name: team.name,
      dbid: team.dbid,
      slug: team.slug,
    },
  },
  name: 'username',
  email: 'useremail',
  accepted_terms: true,
};

describe('<InviteNewAccount />', () => {
  it('should render New Account form', () => {
    const wrapper = mountWithIntlProvider(<InviteNewAccountComponent
      teamSlug={team.slug}
      user={user}
    />);
    expect(wrapper.find('#login')).toHaveLength(1);
    expect(wrapper.find('.int-login__password-confirmation-input input')).toHaveLength(1);
    expect(wrapper.html()).toMatch('has invited you to join the workspace');
  });
});
