import React from 'react';
import { FeedClustersComponent } from './FeedClusters';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedClusters />', () => {
  const feedTeam = {
    team_id: 1,
    permissions: '{"update FeedTeam":true}',
  };

  const feed = {
    dbid: 1,
    name: 'Feed Name',
    licenses: [],
    permissions: '{"update Feed":true}',
    data_points: [1, 2],
    team: {
      slug: 'test',
    },
    clusters: {
      edges: [
        {
          node: {
            id: 'Q2x1c3Rlci8xCg==',
            channels: [0],
            last_request_date: null,
            last_fact_check_date: null,
            media_count: 10,
            requests_count: 20,
            fact_checks_count: 5,
            center: {
              title: 'Cluster one center title',
              description: 'Cluster one center description',
              media: {
                url: null,
                type: 'UploadedImage',
                picture: 'https://assets.checkmedia.org/image/1.png',
              },
            },
            teams: {
              edges: [{
                node: {
                  name: 'Workspace Name',
                  avatar: 'https://assets.checkmedia.org/team/1.png',
                },
              }],
            },
          },
        },
        {
          node: {
            id: 'Q2x1c3Rlci8yCg==',
            channels: [0],
            last_request_date: null,
            last_fact_check_date: null,
            media_count: 5,
            requests_count: 10,
            fact_checks_count: 2,
            center: {
              title: 'Cluster two center title',
              description: 'Cluster two center description',
              media: {
                url: null,
                type: 'Claim',
                picture: null,
              },
            },
            teams: {
              edges: [{
                node: {
                  name: 'Workspace Name',
                  avatar: 'https://assets.checkmedia.org/team/1.png',
                },
              }],
            },
          },
        },
      ],
    },
  };

  it('should render clusters as cards', () => {
    const wrapper = shallowWithIntl(<FeedClustersComponent feed={feed} feedTeam={feedTeam} team={{ slug: 'test' }} />);
    expect(wrapper.find('.feed-clusters__card')).toHaveLength(2);
  });
});
