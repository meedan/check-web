import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { SelectProjectDialogTest } from './SelectProjectDialog';

const team = {
  dbid: 1,
  name: 'teamName',
  slug: 'slugTeam',
  members_count: 1,
  project_groups: { edges: [{ node: { project_group_id: '1', title: 'title' } }] },
  projects: {
    edges: [{
      node: {
        title: 'title', dbid: 2, project_group_id: '1', id: 'ABJvamVjdC70\n', is_default: false,
      },
    }],
  },
  user: {
    dbid: 1,
    name: 'User Name',
  },
};

const team2 = {
  dbid: 1,
  name: 'teamName',
  slug: 'slugTeam',
  members_count: 1,
  project_groups: { edges: [{ node: { project_group_id: '1', title: 'title' } }] },
  projects: {
    edges: [{
      node: {
        title: 'title', dbid: 1, project_group_id: '1', id: 'UHJvamVjdC80\n', is_default: true,
      },
    }],
  },
  user: {
    dbid: 1,
    name: 'User Name',
  },
};

const intl = {
  now: () => {},
  formatDate: () => {},
  formatTime: () => {},
  formatRelative: () => {},
  formatNumber: () => {},
  formatPlural: () => {},
  formatMessage: () => {},
  formatHTMLMessage: () => {},
};
describe('<SelectProjectDialog/>', () => {
  const node = <div />;
  it('should render Select Project Dialog when default folder is on project list ', () => {
    const wrapper = mountWithIntl(<SelectProjectDialogTest
      open
      excludeProjectDbids={[]}
      title={node}
      team={team2}
      intl={intl}
      cancelLabel={node}
      submitLabel={node}
      submitButtonClassName="media-actions-bar__move-button"
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.find('.media-actions-bar__move-button').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Choose a folder');
  });

  it('should render Select Project Dialog when default folder is not on project list', () => {
    const wrapper = mountWithIntl(<SelectProjectDialogTest
      open
      excludeProjectDbids={[]}
      title={node}
      team={team}
      intl={intl}
      cancelLabel={node}
      submitLabel={node}
      submitButtonClassName="media-actions-bar__move-button"
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.find('.media-actions-bar__move-button').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Choose a folder');
  });
});
