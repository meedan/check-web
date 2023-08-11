import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { FeedHeader } from './FeedHeader';

const feed = {
  dbid: 1,
  name: 'Test',
  licenses: [1, 2, 3],
  permissions: '{"update Feed":true}',
  team: {
    slug: 'test',
  },
};

describe('<FeedHeader />', () => {
  it('should render FeedHeader component', () => {
    const feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={feed} />);
    const feedHeader = feedHeaderComponent.find('.feed-header');
    expect(feedHeader).toHaveLength(1);
  });

  it('should render feed licenses icons', () => {
    let feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1] }} />);
    let feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(1);

    feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1, 2] }} />);
    feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(2);

    feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1, 2, 3] }} />);
    feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(3);
  });
});
