import React from 'react';
import { WebhookEntry } from './WebhookEntry';
import { shallowWithIntl, mockIntl } from '../../../../test/unit/helpers/intl-test';

const webhook = {
  id: 'abc123',
  name: 'Test Webhook',
  events: [{ event: 'publish_report' }],
  request_url: 'https://example.com/webhook',
};

describe('<WebhookEntry />', () => {
  it('should render the component', () => {
    const wrapper = shallowWithIntl(<WebhookEntry intl={mockIntl} webhook={webhook} />);
    expect(wrapper.find('span').hostNodes().text()).toEqual('Test Webhook');
    expect(wrapper.find('strong').hostNodes().text()).toEqual('https://example.com/webhook');
  });
});