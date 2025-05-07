import React from 'react';
import { shallowWithIntl, mockIntl } from '../../../../test/unit/helpers/intl-test';
import { WebhookEdit } from './WebhookEdit';

const webhook = {
  id: '123',
  name: 'Test Webhook',
  request_url: 'https://example.com/webhook',
  events: [{ event: 'publish_report' }],
  headers: { Authorization: 'Bearer token' },
};

describe('<WebhookEdit />', () => {
  it('should render the empty create form if no webhook provided', () => {
    const wrapper = shallowWithIntl(<WebhookEdit intl={mockIntl} />);

    expect(wrapper.find('FormattedMessage[id="webhookEdit.dialogTitleCreate"]')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage[id="webhookEdit.dialogTitleEdit"]')).toHaveLength(0);

    expect(wrapper.find('.webhook-edit__name-field').prop('required')).toBe(true);
    expect(wrapper.find('.webhook-edit__name-field').prop('value')).toBe('');


    expect(wrapper.find('.webhook-edit__url-field').prop('required')).toBe(true);
    expect(wrapper.find('.webhook-edit__url-field').prop('value')).toBe('');

    expect(wrapper.find('.webhook-edit__event-select').prop('required')).toBe(true);
    expect(wrapper.find('.webhook-edit__event-select').prop('value')).toBe('update_annotation_verification_status');

    expect(wrapper.find('.webhook-edit__headers-field').prop('required')).toBe(false);
    expect(wrapper.find('.webhook-edit__headers-field').prop('value')).toBe('');
  });

  it('should render the edit form if a webhook is provided', () => {
    const wrapper = shallowWithIntl(<WebhookEdit intl={mockIntl} webhook={webhook} />);

    expect(wrapper.find('FormattedMessage[id="webhookEdit.dialogTitleCreate"]')).toHaveLength(0);
    expect(wrapper.find('FormattedMessage[id="webhookEdit.dialogTitleEdit"]')).toHaveLength(1);

    expect(wrapper.find('.webhook-edit__name-field').prop('value')).toBe(webhook.name);
    expect(wrapper.find('.webhook-edit__url-field').prop('value')).toBe(webhook.request_url);
    expect(wrapper.find('.webhook-edit__event-select').prop('value')).toBe(webhook.events[0].event);
    expect(wrapper.find('.webhook-edit__headers-field').prop('value')).toBe(JSON.stringify(webhook.headers));
  });

  it('should validate the form fields', () => {
    const wrapper = shallowWithIntl(<WebhookEdit intl={mockIntl} />);

    const urlField = wrapper.find('.webhook-edit__url-field');
    urlField.simulate('change', { target: { value: 'whatever' } });
    urlField.simulate('blur');

    wrapper.find('.webhook-edit__submit-button').simulate('click');
    expect(wrapper.find('.webhook-edit__name-field').prop('error')).toBe(true);
    expect(wrapper.find('.webhook-edit__url-field').prop('error')).toBe(true);
  });
});