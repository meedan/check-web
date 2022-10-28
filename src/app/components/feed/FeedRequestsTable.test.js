import React from 'react';
import { FeedRequestsTable } from './FeedRequestsTable';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

describe('<FeedRequestsTable />', () => {
  it('UploadedAudio should use default image as thumbnail', () => {
    const feed = {
      requests: {
        edges: [
          {
            node: {
              id: 123,
              title: 'audio request',
              request_type: 'audio',
              last_submitted_at: '2022-10-27T21:16:25.802Z',
              requests_count: 1,
              subscriptions_count: 0,
            },
          },
        ],
      },
    };
    /* FIXME: We wan't unit-test this because this component includes a FeedFilters component that calls a mutation?
    const component = mountWithIntlProvider((
      <FeedRequestsTable
        tabs={() => {}}
        feed={feed}
        searchUrlPrefix="feed"
        sort=""
        sortType="asc"
        filters={{}}
        feedTeam={{ id: '1' }}
        onChangeSort={() => {}}
        onChangeSortType={() => {}}
        onGoToTheNextPage={() => {}}
        onGoToThePreviousPage={() => {}}
        onChangeFilters={() => {}}
        rangeStart={1}
        rangeEnd={50}
      />
    ));
    expect(component.html()).toMatch('/images/image_placeholder.svg');
    */
  });
});
