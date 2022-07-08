import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import SmoochBotNewsletterEditor from './SmoochBotNewsletterEditor';

describe('<SmoochBotNewsletterEditor />', () => {
  it('should render a pre-filled newsletter', () => {
    const wrapper = mountWithIntl(<SmoochBotNewsletterEditor
      installationId="foo"
      newsletter={{
        smooch_newsletter_feed_url: 'http://example.com',
        smooch_newsletter_day: 'thursday',
        smooch_newsletter_introduction: 'Hello',
        smooch_newsletter_time: '8',
        smooch_newsletter_timezone: 'America/Tijuana (GMT-07:00)',
      }}
      language="en"
      onChange={() => {}}
    />);

    expect(wrapper.html()).toMatch(/Send the newsletter/);
    expect(wrapper.find('div#day-select').text()).toMatch(/Thursday/);
    expect(wrapper.find('div#time-select').text()).toMatch(/8:00/);
    expect(wrapper.find('div#timezone-select').text()).toMatch(/America\/Tijuana \(GMT-7\)/);
  });

  it('should count number of characters in a newsletter', () => {
    const wrapper = mountWithIntl(<SmoochBotNewsletterEditor
      installationId="foo"
      newsletter={{
        smooch_newsletter_feed_url: '',
        smooch_newsletter_day: 'thursday',
        smooch_newsletter_introduction: 'Hello',
        smooch_newsletter_time: '8',
        smooch_newsletter_timezone: 'America/Tijuana (GMT-07:00)',
        smooch_newsletter_body: 'Test',
        smooch_newsletter_introduction: 'Foo',
      }}
      language="en"
      onChange={() => {}}
    />);

    expect(wrapper.html()).toMatch(/1015\/1024 characters available/);
  });
});
