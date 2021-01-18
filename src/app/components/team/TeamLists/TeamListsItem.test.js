import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import TeamListsItem from './TeamListsItem';

describe('<TeamListsItem />', () => {
  const team = {
    slug: 'new-team',
    id: '1',
  };

  const column = {
    index: 1,
    key: 'key-content',
    label: 'label-content-1',
    show: true,
  };

  const column2 = {
    index: 2,
    key: 'key-content',
    label: 'label-content-2',
    show: false,
  };

  it('render item and hide button', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('Hide');
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.find('#team-lists__item-1-key-content').hostNodes()).toHaveLength(1);
  });

  it('render item and show button', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column2}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('Show');
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.find('#team-lists__item-2-key-content').hostNodes()).toHaveLength(1);
  });
});
