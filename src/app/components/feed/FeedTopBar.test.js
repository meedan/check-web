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
  teams: {
    edges: [
      {
        node: {
          dbid: 1,
          slug: 'test',
          avatar: 'https://example.com',
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
    const feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(1);
  });

  it('should not render anything if feed is not published', () => {
    const feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, published: false }} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    const feedTopBar = feedTopBarComponent.find('.feed-top-bar');
    expect(feedTopBar).toHaveLength(0);
  });

  it('should render list name if there is a list', () => {
    let feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    let feedTopBar = feedTopBarComponent.find('.feed-top-bar-list');
    expect(feedTopBar).toHaveLength(1);

    feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, saved_search: null }} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    feedTopBar = feedTopBarComponent.find('.feed-top-bar-list');
    expect(feedTopBar).toHaveLength(0);
  });

  it('should render settings icon if there is permission', () => {
    let feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={feed} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    let feedTopBar = feedTopBarComponent.find('button.int-feed-top-bar__icon-button--settings');
    expect(feedTopBar).toHaveLength(1);

    feedTopBarComponent = mountWithIntlProvider(<FeedTopBar feed={{ ...feed, permissions: '{}' }} team={team} setTeamFilters={ ()=>{} } teamFilters={teamFiltersAll} />);
    feedTopBar = feedTopBarComponent.find('button.int-feed-top-bar__icon-button--settings');
    expect(feedTopBar).toHaveLength(0);
  });
});
