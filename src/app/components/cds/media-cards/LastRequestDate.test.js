import React from 'react';
import LastRequestDate from './LastRequestDate';
import { shallowWithIntl, mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('LastRequestDate', () => {
  it('doesn\'t render if no valid date is provided', () => {
    let wrapper = shallowWithIntl(<LastRequestDate lastRequestDate={null} />);
    expect(wrapper.html()).toEqual('');

    wrapper = shallowWithIntl(<LastRequestDate lastRequestDate={0} />);
    expect(wrapper.html()).toEqual('');

    wrapper = shallowWithIntl(<LastRequestDate lastRequestDate="jellyfish" />);
    expect(wrapper.html()).toEqual('');

    wrapper = shallowWithIntl(<LastRequestDate />);
    expect(wrapper.html()).toEqual('');
  });

  it('renders a date', () => {
    const lastRequestDate = new Date('2020-01-01T00:00:00Z');
    const wrapper = mountWithIntl(<LastRequestDate lastRequestDate={lastRequestDate} />);
    expect(wrapper.html()).toContain('January 1, 2020');
  });
});
