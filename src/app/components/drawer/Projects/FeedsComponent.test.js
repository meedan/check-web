import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import FeedsComponent from './FeedsComponent';

describe('<FeedsComponent />', () => {
  it('should filter out FeedInvitation type feeds when there are two feeds with the same dbid', () => {
    const team = {
      dbid: 1,
      slug: 'team-slug',
      medias_count: 10,
      permissions: '{"create Media":true}',
      verification_statuses: {},
    };

    const feeds = [
      { id: '1', dbid: 1, name: 'FeedInvitation' },
      { id: '2', dbid: 1, name: 'FeedInvitation' },
      { id: '3', dbid: 2, name: 'OtherType' },
    ];


    global.window = Object.create(window);
    global.window.storage = {
      getValue: jest.fn(),
    };
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/team/feed/3/feed',
      },
    });
    const wrapper = mountWithIntl(<FeedsComponent team={team} feeds={feeds} />);
    console.log(wrapper.debug());
  });
});