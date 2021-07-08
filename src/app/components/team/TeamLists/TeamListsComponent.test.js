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
    expect(wrapper.find('.MuiTypography-subtitle2').hostNodes()).toHaveLength(3);
    expect(wrapper.html()).toMatch('Displayed columns');
    expect(wrapper.html()).toMatch('General');
    expect(wrapper.html()).toMatch('Metadata');
  });

  it('should render create metadata button', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.html()).toMatch('Create new metadata field');
    expect(wrapper.find('#create-metadata__add-button').hostNodes()).toHaveLength(1);
  });

  it('should render all the item columns', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.html()).toMatch('team-lists__item-0-key-content1');
    expect(wrapper.html()).toMatch('team-lists__item-1-key-content2');
    expect(wrapper.html()).toMatch('team-lists__item-2-key-content3');
    wrapper.find('.MuiButton-text').at(0).simulate('click');
  });

  it('should hide item column', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team2} />);
    expect(wrapper.html()).toMatch('Hide');
    expect(wrapper.html()).not.toMatch('Show');
    wrapper.find('.MuiButton-text').hostNodes().simulate('click');
    expect(wrapper.html()).toMatch('Show');
    expect(wrapper.html()).not.toMatch('Hide');
  });

  it('should render reorder buttons', () => {
    const wrapper = mountWithIntl(<TeamListsComponent team={team} />);
    expect(wrapper.find('.reorder__button-up').hostNodes()).toHaveLength(2);
    expect(wrapper.find('.reorder__button-down').hostNodes()).toHaveLength(2);
  });
});
