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

  it('should render collum', () => {
    const wrapper = mountWithIntl(<TeamListsColumn
      title="Colum title"
      columns={columns}
      team={team}
      onToggle={() => {}}
    />);
    expect(wrapper.find('.MuiTypography-subtitle2').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Colum title');
    expect(wrapper.html()).toMatch('label-content-1');
    expect(wrapper.html()).toMatch('label-content-2');
    expect(wrapper.html()).toMatch('label-content-3');
  });
});
