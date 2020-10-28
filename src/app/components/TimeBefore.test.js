/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';

import TimeBefore from './TimeBefore';

describe('<TimeBefore />', () => {
  it('should display relative time correctly', () => {
    const now = new Date(new Date().getTime() - (60 * 1000));
    const wrapper = mountWithIntlProvider(<TimeBefore date={now} />);
    const container = wrapper.find('time');
    expect(container.length).toEqual(1);
    const content = wrapper.find('time span');
    expect(content.length).toEqual(1);
    expect(content.text()).toMatch('ago');
  });

  it('should display absolute time correctly', () => {
    const wrapper = mountWithIntlProvider(<TimeBefore date={new Date('2017-02-08T17:19:40Z')} />);
    const container = wrapper.find('time');
    expect(container.length).toEqual(1);
    expect(container.prop('dateTime')).toEqual('2017-02-08T17:19:40.000Z');
    expect(container.prop('title')).toEqual('February 8, 2017, 5:19 PM');
    const content = wrapper.find('time');
    expect(content.length).toEqual(1);
    expect(content.text()).toMatch('2017');
  });
});
