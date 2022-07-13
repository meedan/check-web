import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { SelectProjectDialogTest } from './SelectProjectDialog';

const team = {
  dbid: 1,
  name: 'teamName',
  slug: 'slugTeam',
  members_count: 1,
  project_groups: { edges: [{ node: { project_group_id: '1' } }] },
  projects: { edges: [{ node: { project_group_id: '1' } }] },
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
  // render Dialog even without pass team default folder
  it('should render Select Project Dialog', () => {
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
