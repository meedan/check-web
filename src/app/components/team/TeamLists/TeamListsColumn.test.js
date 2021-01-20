import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import TeamListsColumn from './TeamListsColumn';

describe('<TeamListsColumn />', () => {
  const columns = [
    {
      index: 1, key: 'key-content1', label: 'label-content-1', show: true,
    },
    {
      index: 2, key: 'key-content2', label: 'label-content-2', show: true,
    },
    {
      index: 3, key: 'key-content3', label: 'label-content-3', show: false,
    },
  ];

  const team = {
    slug: 'new-team',
    id: '1',
    team_bot_installations: {
      edges: [],
    },
  };

  it('should render team list column title and the list items', () => {
    const wrapper = mountWithIntl(<TeamListsColumn
      title="Column title"
      columns={columns}
      team={team}
      onToggle={() => {}}
    />);
    expect(wrapper.find('.MuiTypography-subtitle2').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Column title');
    expect(wrapper.html()).toMatch('label-content-1');
    expect(wrapper.html()).toMatch('label-content-2');
    expect(wrapper.html()).toMatch('label-content-3');
    expect(wrapper.html()).not.toMatch('None available');
  });

  it('should render team list column title and the placeholder when there are no items in the list', () => {
    const wrapper = mountWithIntl(<TeamListsColumn
      title="Column title"
      columns={[]}
      team={team}
      onToggle={() => {}}
    />);
    expect(wrapper.find('.MuiTypography-subtitle2').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Column title');
    expect(wrapper.html()).toMatch('None available');
  });
});
