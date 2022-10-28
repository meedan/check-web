import React from 'react';
import { FeedRequestedMedia } from './FeedRequestedMedia';
import MediaCardCondensed from './MediaCardCondensed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedRequestedMedia />', () => {
  it('should display media quote as title', () => {
    const request = {
      dbid: 1,
      request_type: 'text',
      feed: {
        name: 'Test Feed',
      },
      medias: {
        edges: [
          {
            node: {
              dbid: 1,
              type: 'Claim',
              quote: 'Hello Text Claim',
            },
          },
        ],
      },
    };
    const component = shallowWithIntl(<FeedRequestedMedia request={request} />);
    expect(component.find(MediaCardCondensed).props().title).toEqual('Hello Text Claim');
  });

  it('should display generated slug as title', () => {
    const request = {
      dbid: 1,
      request_type: 'audio',
      feed: {
        name: 'Test Feed',
      },
      medias: {
        edges: [
          {
            node: {
              dbid: 1,
              type: 'UploadedAudio',
            },
          },
        ],
      },
    };
    const component = shallowWithIntl(<FeedRequestedMedia request={request} />);
    expect(component.find(MediaCardCondensed).props().title).toEqual('audio-Test-Feed-1');
  });
});
