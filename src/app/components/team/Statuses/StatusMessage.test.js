import React from 'react';
import StatusMessage from './StatusMessage';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

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
    expect(wrapper.find('.test__status-message').hostNodes()).toHaveLength(1);
  });
});
