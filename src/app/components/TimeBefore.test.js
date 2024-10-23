import React from 'react';
import TimeBefore from './TimeBefore';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';


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

  it('should display date and time when includeTime is true', () => {
    const wrapper = mountWithIntlProvider(<TimeBefore date={new Date('2023-10-01T10:30:00Z')} includeTime />);
    const content = wrapper.find('time');
    expect(content.text()).toMatch('2023');
    expect(content.text()).toMatch('10:30 AM');
  });

  it('should display only date when includeTime is not passed', () => {
    const wrapper = mountWithIntlProvider(<TimeBefore date={new Date('2023-10-01T10:30:00Z')} />);
    const content = wrapper.find('time');
    expect(content.text()).toMatch('2023');
    expect(content.text()).not.toMatch('10:30 AM');
  });
});
