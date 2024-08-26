import React from 'react';
import { mount } from 'enzyme';
import ItemChannels from './ItemChannels';

describe('ItemChannels', () => {
  it('should render main channel icon', () => {
    const channels = {
      main: '0',
    };

    const wrapper = mount(<ItemChannels channels={channels} sortMainFirst />);
    expect(wrapper.find('.channel-icon--main')).toHaveLength(1);
    expect(wrapper.find('.channel-icon--other')).toHaveLength(0);
  });

  it('should render other channels icons', () => {
    const channels = {
      main: '0',
      others: ['10', '13', '8'],
    };

    const wrapper = mount(<ItemChannels channels={channels} sortMainFirst />);
    expect(wrapper.find('.channel-icon--other')).toHaveLength(3);
    expect(wrapper.find('span').at(1).prop('title')).toEqual('Instagram');
    expect(wrapper.find('span').at(2).prop('title')).toEqual('Line');
    expect(wrapper.find('span').at(3).prop('title')).toEqual('Telegram');
  });
});
