import React from 'react';
import { mount } from 'enzyme';
import TabWrapper from './TabWrapper';

// mock ResizeObserver to avoid errors
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback;
  }

  observe = () => {
    // mock of observe
  };

  unobserve = () => {
    // mock of unobserve
  };

  disconnect = () => {
    // mock of disconnect
  };
};

describe('TabWrapper', () => {
  it('renders the correct number of tabs', () => {
    const tabs = [
      { value: 'tab1', label: 'Tab 1', show: true },
      { value: 'tab2', label: 'Tab 2', show: true },
      { value: 'tab3', label: 'Tab 3', show: true },
    ];

    const wrapper = mount(<TabWrapper tabs={tabs} onChange={() => {}} />);
    const tabElements = wrapper.find('option');
    expect(tabElements.length).toBe(tabs.length);
  });
});
