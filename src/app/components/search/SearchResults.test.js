import React from 'react';
import { shallow } from 'enzyme';
import { SearchResultsComponentTest } from './SearchResults';

describe('<SearchResults />', () => {
  const permissions = JSON.stringify({ 'create Media': true, 'create ClaimDescription': true });
  const team = {
    slug: 'new-team',
    id: '1',
    name: 'new-team',
    dbid: 1,
    permissions,
  };

  const feeds = {
    edges: [
      {
        node: {
          dbid: 1,
          id: 'abc1',
          name: 'Feed test',
        },
      },
    ],
  };

  const search = {
    id: '1',
    medias: {
      edges: [
        {
          node: {
            id: 'zyx1',
            dbid: 1,
            quote: 'Hello Text Claim',
            list_columns_values: {},
          },
        },
      ],
    },
    number_of_results: 1,
  };

  it('Should render feed icon when list is related to a feed', () => {
    const wrapper = shallow(<SearchResultsComponentTest
      team={team}
      search={search}
      projectGroup={null}
      clientSessionId="checkClientSessionId"
      mediaUrlPrefix=""
      searchUrlPrefix=""
      title="title"
      savedSearch={{
        id: '1',
        is_part_of_feeds: true,
        title: 'bla',
        filters: '{"verification_status":["undetermined"],"timestamp":1687444240820}',
        feeds,
      }}
      pusher={{
        subscribe: () => () => null,
        unsubscribe: () => {},
      }}
      page="list"
      relay={{}}
      feedTeam={null}
      query={{ verification_status: ['undetermined'] }}
    />);
    expect(wrapper.find('#shared-feed__icon')).toHaveLength(1);
  });

  it('Should not render feed icon when list is not related to a feed', () => {
    const wrapper = shallow(<SearchResultsComponentTest
      team={team}
      search={search}
      projectGroup={null}
      clientSessionId="checkClientSessionId"
      mediaUrlPrefix=""
      searchUrlPrefix=""
      title="title"
      page="all-items"
      relay={{}}
      pusher={{
        subscribe: () => () => null,
        unsubscribe: () => {},
      }}
      savedSearch={{
        id: '1',
        is_part_of_feeds: false,
        title: 'bla',
        filters: '{"verification_status":["undetermined"],"timestamp":1687444240820}',
        feeds,
      }}
      feedTeam={null}
      query={{ verification_status: ['undetermined'] }}
    />);
    expect(wrapper.find('#shared-feed__icon')).toHaveLength(0);
  });
});
