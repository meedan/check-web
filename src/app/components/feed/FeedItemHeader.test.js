import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { FeedItemHeader } from './FeedItemHeader';

describe('<FeedItemHeader />', () => {
  const feed = {
    dbid: 1,
    name: 'Feed Name',
  };

  const cluster = {
    last_request_date: null,
    center: {
      title: 'Cluster one center title',
      media: {
        url: null,
        type: 'UploadedImage',
        picture: 'https://assets.checkmedia.org/image/1.png',
      },
    },
  };

  it('should render header', () => {
    const wrapper = shallowWithIntl(<FeedItemHeader teamSlug="test" feed={feed} cluster={cluster} />);
    expect(wrapper.find('#feed-item-page-header')).toHaveLength(1);
  });
});
