import React from 'react';
import { FeedTopBar } from './FeedTopBar';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

const feed = {
  published: true,
  permissions: '{"update Feed":true}',
  saved_search: {
    dbid: 1,
    title: 'Test',
  },
  feed_teams: {
    edges: [
      {
        node: {
          team: {
            dbid: 1,
            slug: 'test',
            avatar: 'https://example.com',
          },
        },
      },
    ],
  },
};

const team = {
  slug: 'test',
};

const teamFiltersAll = [1];

describe('<FeedTopBar />', () => {
  it('should render FeedTopBar component', () => {
    const feedTopBarComponent = shallowWithIntl(<FeedTopBar feed={feed} setTeamFilters={() => {}} team={team} teamFilters={teamFiltersAll} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(1);
  });

  it('should not render anything if feed is not published', () => {
    const feedTopBarComponent = shallowWithIntl(<FeedTopBar feed={{ ...feed, published: false }} setTeamFilters={() => {}} team={team} teamFilters={teamFiltersAll} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(0);
  });
});
