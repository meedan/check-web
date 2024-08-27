import React from 'react';
import { FeedHeader } from './FeedHeader';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

const feed = {
  dbid: 1,
  name: 'Test',
  licenses: [1, 2, 3],
  permissions: '{"update Feed":true}',
  team: {
    slug: 'test',
    dbid: 123,
  },
};

const feedTeam = {
  team_id: 123,
  permissions: '{"update FeedTeam":true}',
};

describe('<FeedHeader />', () => {
  it('should render FeedHeader component', () => {
    const feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={feed} feedTeam={feedTeam} />);
    const feedHeader = feedHeaderComponent.find('.feed-header');
    expect(feedHeader).toHaveLength(1);
  });

  it('should render feed licenses icons', () => {
    let feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1] }} feedTeam={feedTeam} />);
    let feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(1);

    feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1, 2] }} feedTeam={feedTeam} />);
    feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(2);

    feedHeaderComponent = mountWithIntlProvider(<FeedHeader feed={{ ...feed, licenses: [1, 2, 3] }} feedTeam={feedTeam} />);
    feedHeaderIcons = feedHeaderComponent.find('.feed-header-icon').hostNodes();
    expect(feedHeaderIcons).toHaveLength(3);
  });
});
