import React from 'react';
import WebhookDelete from './WebhookDelete';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<WebhookDelete />', () => {
  it('should render the component', () => {
    const wrapper = mountWithIntl(<WebhookDelete webhookId="abc123" />);
    expect(wrapper.find('.webhook-delete__open-dialog-button').hostNodes()).toHaveLength(1);
  });
});
