import React from 'react';
import ChatFeed from './ChatFeed';
import Message from './Message';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ChatFeed />', () => {
  it('should skip Messenger template messages and render only valid messages', () => {
    const history = [
      {
        dbid: 1,
        event: null,
        payload: {
          text: null,
          override: {
            messenger: {
              payload: {
                tag: 'ACCOUNT_UPDATE',
                messaging_type: 'MESSAGE_TAG',
              },
            },
          },
        },
        sent_at: '1744455089',
      },
      {
        dbid: 2,
        direction: 'outgoing',
        language: 'en',
        platform: 'Facebook Messenger',
        uid: 'pizza112',
        external_id: 'pizza1723',
        payload: {
          text: 'Valid message',
        },
        sent_at: '1744455090',
        state: 'sent',
        media_url: null,
        id: 'pizza112dsd',
      },
      {
        dbid: 3,
        event: null,
        payload: {
          text: '*FACT CHECK: NO Guinness World Record for Duterte birthday rallies*',
          override: {
            messenger: {
              payload: {
                tag: 'ACCOUNT_UPDATE',
                message: {
                  text: '*FACT CHECK: NO Guinness World Record for Duterte birthday rallies*',
                },
                messaging_type: 'MESSAGE_TAG',
              },
            },
          },
        },
        sent_at: '1744455091',
      },
    ];

    const wrapper = mountWithIntl(
      <ChatFeed history={history} intl={{ locale: 'en' }} />,
    );

    expect(wrapper.find(Message).length).toBe(1); // Only one valid message is rendered
    expect(wrapper.text()).toContain('Valid message');
    expect(wrapper.text()).not.toContain('*FACT CHECK: NO Guinness World Record for Duterte birthday rallies*');
    expect(wrapper.text()).not.toContain('Unsupported message');
  });
});
