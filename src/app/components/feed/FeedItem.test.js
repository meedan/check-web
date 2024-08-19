import React from 'react';
import { FeedItemComponent } from './FeedItem';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedItemComponent />', () => {
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

  it('should render feed item page', () => {
    const wrapper = shallowWithIntl(<FeedItemComponent cluster={cluster} feed={feed} teamSlug="test" />);
    expect(wrapper.find('#feed-item-page')).toHaveLength(1);
  });
});
