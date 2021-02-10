import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import StatusMessage from './StatusMessage';

const statuses = [
  {
    id: '1',
    locales: {
      pt: { label: 'true', description: 'description x', message: 'message to be sent' },
    },
    style: { color: 'black' },
    label: 'false',
    should_send_message: true,
  },
];
describe('<StatusMessage/>', () => {
  it('should render status message', () => {
    const wrapper = mountWithIntl(<StatusMessage
      statuses={statuses}
      defaultLanguage="en"
      CurrentLanguage="pt"
      onSubmit={() => {}}
      message="status message"
    />);
    expect(wrapper.html()).toMatch('status message');
    expect(wrapper.find('.status-message').hostNodes()).toHaveLength(1);
  });
});
