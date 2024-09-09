import React from 'react';
import ChatHistory from './ChatHistory';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('ChatHistory component', () => {
  const mockTiplineMessage = {
    id: 9941551,
    event: null,
    direction: 'incoming',
    language: 'pt_BR',
    platform: 'WhatsApp',
    sent_at: new Date('Wed, 22 Nov 2023 17:30:30.000000000 UTC +00:00'),
    uid: '126709780531714:126709231714',
    external_id: '123343434',
    payload: {
      app: { _id: '126709780531714' },
      capi: {
        entry: [
          {
            id: '126709780531714',
            changes: [
              {
                field: 'messages',
                value: {
                  contacts: [{ wa_id: '123343434', profile: { name: 'Test name' } }],
                  messages: [
                    {
                      id: '123343434',
                      from: '123343434',
                      type: 'button',
                      button: { text: 'Receber checagem', payload: 'Receber checagem' },
                      context: {
                        id: '123343434',
                        from: '126709780531714',
                      },
                      timestamp: '1700674230',
                    },
                  ],
                  metadata: {
                    phone_number_id: '1233434349',
                    display_phone_number: '1233434344',
                  },
                  messaging_product: 'whatsapp',
                },
              },
            ],
          },
        ],
        object: 'whatsapp_business_account',
      },
      appUser: { _id: '123343434:123343434', conversationStarted: true },
      trigger: 'message:appUser',
      version: 'v1.1',
      messages: [
        {
          _id: '123343434',
          name: 'Test name',
          text: '',
          type: 'button',
          source: {
            type: 'whatsapp',
            originalMessageId: '123343434',
          },
          payload: null,
          authorId: '123343434:123343434',
          language: 'pt_BR',
          received: 1700674230,
          quotedMessage: { content: { _id: '123343434ZDN' } },
        },
      ],
    },
    team_id: 1797,
    created_at: new Date('Wed, 22 Nov 2023 17:30:34.652769000 UTC +00:00'),
    updated_at: new Date('Wed, 22 Nov 2023 17:30:34.652769000 UTC +00:00'),
    state: 'received',
  };

  it('should parse message from capi structure', () => {
    const wrapper = mountWithIntl(
      <ChatHistory
        dateTime="1701714951"
        handleClose={() => {}}
        history={[mockTiplineMessage]}
        intl={{}}
        title="Chat History"
      />,
    );

    expect(wrapper.html()).toMatch('Receber checagem');
  });
});
