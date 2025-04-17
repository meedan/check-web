import React from 'react';
import Message from './Message';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import IconBot from '../../../icons/smart_toy.svg';

describe('<Message />', () => {
  it('should display the unsupported message fallback when text is null', () => {
    const wrapper = mountWithIntl(
      <Message
        content=""
        dateTime="2025-04-15T12:00:00Z"
        meessageId={32535974}
        messageEvent={null}
        userMessage={false}
        userOnRight={false}
        userSelection={false}
      />,
    );

    expect(wrapper.find('.typography-body1').text()).toContain('Unsupported message');
    expect(wrapper.find(IconBot).length).toBe(1);
  });
});
