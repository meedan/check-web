import React from 'react';
import NewsletterScheduler, { getWeekDays } from './NewsletterScheduler';

import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

const baseProps = {
  scheduled: false,
  lastDeliveryError: null,
  day: 1,
  time: '10:00',
  timezone: 'America/New_York',
  type: 'static',
  onUpdate: () => {},
};

describe('<NewsletterScheduler />', () => {
  it('should returns localized week day', () => {
    const firstDayOfWeek = getWeekDays('pt-BR').labels[0];
    expect(firstDayOfWeek).toBe('dom.');
  });

  it('should returns days of the week starting by Sunday for America timezone', () => {
    process.env.TZ = 'America/New_York';
    const firstDayOfWeek = getWeekDays('en-US').labels[0];
    expect(firstDayOfWeek).toBe('Sun');
  });

  it('should returns days of the week starting by Sunday for India timezone', () => {
    process.env.TZ = 'Asia/Calcutta';
    const firstDayOfWeek = getWeekDays('en-US').labels[0];
    expect(firstDayOfWeek).toBe('Sun');
  });

  it('should shows CONTENT_HASNT_CHANGED alert when lastDeliveryError is set', () => {
    const wrapper = mountWithIntl(<NewsletterScheduler {...baseProps}lastDeliveryError="CONTENT_HASNT_CHANGED" />);
    expect(wrapper.text()).toContain('The newsletter was not sent because its content has not been updated since the last successful delivery');
  });

  it('should shows RSS_ERROR alert when lastDeliveryError is set', () => {
    const wrapper = mountWithIntl(<NewsletterScheduler {...baseProps} lastDeliveryError="RSS_ERROR" />);
    expect(wrapper.text()).toContain('The newsletter was not sent because no content could be retrieved from the RSS feed');
  });

  it('should hide alert after handleUpdate is called', () => {
    const onUpdate = jest.fn();
    const wrapper = mountWithIntl(<NewsletterScheduler {...baseProps} lastDeliveryError="RSS_ERROR" scheduled type="static" onUpdate={onUpdate} />);
    expect(wrapper.text()).toContain('The newsletter was not sent because no content could be retrieved from the RSS feed');

    // Simulate clicking the "Pause" button
    wrapper.find('button').filterWhere(btn => btn.text().toLowerCase().includes('pause')).simulate('click');
    expect(wrapper.text()).not.toContain('The newsletter was not sent because no content could be retrieved from the RSS feed');
  });

  it('should sync showDeliveryError state with lastDeliveryError prop changes', () => {
    const wrapper = mountWithIntl(<NewsletterScheduler {...baseProps} lastDeliveryError={null} />);
    expect(wrapper.text()).not.toContain('The newsletter was not sent because its content has not been updated since the last successful delivery');

    // Update the prop to trigger the alert
    wrapper.setProps({ lastDeliveryError: 'CONTENT_HASNT_CHANGED' });
    wrapper.update();
    expect(wrapper.text()).toContain('The newsletter was not sent because its content has not been updated since the last successful delivery');
  });
});
