import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import DrawerContent from './index';


describe('<DrawerContent />', () => {
  const team = {
    id: '1',
    name: 'teamName',
    slug: 'slugTeam',
    members_count: 1,
    project_groups: { edges: [{ node: { project_group_id: '1', title: 'title' } }] },
    projects: {
      edges: [{
        node: {
          title: 'title', dbid: 2, project_group_id: '1', id: 'ABJvamVjdC70\n',
        },
      }],
    },
  };

  it('does not render Projects if user is on login page', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: 'https://checkmedia.org/',
      },
    });
    const wrapper = mountWithIntl(<DrawerContent
      team={team}
    />);
    expect(wrapper.html()).toEqual(null);
  });
});
