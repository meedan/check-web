import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { FeedTopBar } from './FeedTopBar';

const feed = {
  published: true,
  permissions: '{"update Feed":true}',
  saved_search: {
    dbid: 1,
    title: 'Test',
  },
};

const team = {
  slug: 'test',
};

describe('<FeedTopBar />', () => {
  it('should render FeedTopBar component', () => {
    const feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(1);
  });

  it('should not render anything if feed is not published', () => {
    const feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, published: false }} team={team} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(0);
  });

  it('should render list name if there is a list', () => {
    let feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} />);
    let feedTopBar = feedTopBarComponent.find('.feed-top-bar-list');
    expect(feedTopBar).toHaveLength(1);

    feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, saved_search: null }} team={team} />);
    feedTopBar = feedTopBarComponent.find('.feed-top-bar-list');
    expect(feedTopBar).toHaveLength(0);
  });

  it('should render settings icon if there is permission', () => {
    let feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} />);
    let feedTopBar = feedTopBarComponent.find('svg');
    expect(feedTopBar).toHaveLength(1);

    feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, permissions: '{}' }} team={team} />);
    feedTopBar = feedTopBarComponent.find('svg');
    expect(feedTopBar).toHaveLength(0);
  });
});
