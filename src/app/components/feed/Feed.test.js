import React from 'react';
import { FeedComponent } from './Feed';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

const routeParams = {
  team: 'test',
  feedId: '1',
  tab: 'shared',
};

const team = {
  feed: {
    dbid: 1,
    filters: {},
    name: 'Test Feed',
    published: true,
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
    const component = mountWithIntlProvider(<FeedComponent routeParams={routeParams} team={{ feed: null }} />);
    expect(component).toEqual({});
  });

  it('should show shared content from the current workspace', () => {
    routeParams.tab = 'shared';
    const component = mountWithIntlProvider(<FeedComponent routeParams={routeParams} team={team} />);
    expect(component.find('#feed__from-workspace').length).toEqual(1);
    expect(component.find('#feed__fact-checks').length).toEqual(0);
    expect(component.find('#feed__clusters').length).toEqual(0);
  });

  it('should show fact-checks', () => {
    routeParams.tab = 'feed';
    team.feed.published = true;
    const component = mountWithIntlProvider(<FeedComponent routeParams={routeParams} team={team} />);
    expect(component.find('#feed__from-workspace').length).toEqual(0);
    expect(component.find('#feed__fact-checks').length).toEqual(1);
    expect(component.find('#feed__clusters').length).toEqual(0);
  });

  it('should show clusters', () => {
    routeParams.tab = 'feed';
    team.feed.published = false;
    const component = mountWithIntlProvider(<FeedComponent routeParams={routeParams} team={team} />);
    expect(component.find('#feed__from-workspace').length).toEqual(0);
    expect(component.find('#feed__fact-checks').length).toEqual(0);
    expect(component.find('#feed__clusters').length).toEqual(1);
  });
});
