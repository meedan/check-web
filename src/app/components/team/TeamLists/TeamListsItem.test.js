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

  const column3 = {
    index: 2,
    key: 'task_value_1',
    label: 'label-content-3',
    show: false,
  };

  it('should render item and hide button', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('Hide');
    expect(wrapper.html()).not.toMatch('Show');
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.find('#team-lists__item-1-key-content').hostNodes()).toHaveLength(1);
  });

  it('should render item and show button', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column2}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Hide');
    expect(wrapper.html()).toMatch('Show');
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.find('#team-lists__item-2-key-content').hostNodes()).toHaveLength(1);
  });

  it('should render reorder buttons when it is passed', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      onMoveDown={() => {}}
      onMoveUp={() => {}}
      team={team}
      column={column}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.find('#team-lists__item-1-key-content').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.reorder__button-up').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.reorder__button-down').hostNodes()).toHaveLength(1);
  });

  it('should not render reorder buttons', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('label-content');
    expect(wrapper.find('#team-lists__item-1-key-content').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.reorder__button-up').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.reorder__button-down').hostNodes()).toHaveLength(0);
  });

  it('should display Annotation label', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column3}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('Annotation');
    expect(wrapper.html()).not.toMatch('General');
    expect(wrapper.find('#team-lists__item-2-task_value_1').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('label-content-3');
  });

  it('should display General label', () => {
    const wrapper = mountWithIntl(<TeamListsItem
      team={team}
      column={column}
      onToggle={() => {}}
    />);
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.html()).not.toMatch('Annotation');
    expect(wrapper.find('#team-lists__item-1-key-content').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('label-content');
  });
});
