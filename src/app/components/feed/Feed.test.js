import React from 'react';
import { FeedComponent } from './Feed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';

const routeParams = {
  team: 'test',
  feedId: '1',
};

const team = {
  feed: {
    dbid: 1,
    filters: {},
    name: 'Test Feed',
    published: true,
    data_points: [],
    current_feed_team: {
      dbid: 1,
      shared: true,
    },
    teams: {
      edges: [
        {
          node: {
            dbid: 1,
          },
        },
      ],
    },
  },
};

describe('<FeedComponent />', () => {
  it('should redirect if no feed', () => {
    const component = shallowWithIntl(<FeedComponent routeParams={routeParams} team={{ feed: null }} />);
    expect(component).toEqual({});
  });

  it('should show fact-checks', () => {
    routeParams.tab = 'feed';
    team.feed.published = true;
    team.feed.data_points = [CheckFeedDataPoints.PUBLISHED_FACT_CHECKS];
    const component = shallowWithIntl(<FeedComponent routeParams={routeParams} team={team} />);
    expect(component.find('#feed__from-workspace').length).toEqual(0);
    expect(component.find('#feed__fact-checks').length).toEqual(1);
    expect(component.find('#feed__clusters').length).toEqual(0);
  });

  it('should show clusters', () => {
    routeParams.tab = 'feed';
    team.feed.published = true;
    team.feed.data_points = [CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS];
    const component = shallowWithIntl(<FeedComponent routeParams={routeParams} team={team} />);
    expect(component.find('#feed__from-workspace').length).toEqual(0);
    expect(component.find('#feed__fact-checks').length).toEqual(0);
    expect(component.find('#feed__clusters').length).toEqual(1);
  });
});
