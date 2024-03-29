import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import TeamListsComponent from './TeamListsComponent';

describe('<TeamListsComponent />', () => {
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
    list_columns: columns,
    smooch_bot: null,
  };

  const team2 = {
    slug: 'new-team2',
    id: '2',
    list_columns: [
      {
        index: 1, key: 'key-content1', label: 'label-content-1', show: true,
      },
    ],
    smooch_bot: null,
  };

  it('should render all list columns', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.find('.typography-subtitle2').hostNodes()).toHaveLength(3);
    expect(wrapper.html()).toMatch('Displayed');
    expect(wrapper.html()).toMatch('General (hidden)');
    expect(wrapper.html()).toMatch('Annotations (hidden)');
  });

  it('should render create metadata button', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.html()).toMatch('Create new annotation field');
    expect(wrapper.find('#create-metadata__add-button').hostNodes()).toHaveLength(1);
  });

  it('should render all the item columns', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.html()).toMatch('team-lists__item-0-key-content1');
    expect(wrapper.html()).toMatch('team-lists__item-1-key-content2');
    expect(wrapper.html()).toMatch('team-lists__item-2-key-content3');
    wrapper.find('.int-list-toggle__button').at(0).simulate('click');
  });

  it('should hide item column', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team2} />);
    const button = wrapper.find('.int-list-toggle__button').at(0);
    expect(button.html()).toMatch('Hide');
    expect(button.html()).not.toMatch('Display');
    button.simulate('click');
    expect(wrapper.html()).toMatch('Display');
    expect(wrapper.html()).not.toMatch('Hide');
  });

  it('should render reorder buttons', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.find('.int-reorder__button-up').hostNodes()).toHaveLength(2);
    expect(wrapper.find('.int-reorder__button-down').hostNodes()).toHaveLength(2);
  });
});
