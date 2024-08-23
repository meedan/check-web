import React from 'react';
import { FeedItemTeams } from './FeedItemTeams';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedItemTeams />', () => {
  const team = {
    id: '1',
    dbid: '1',
    name: 'teamName',
    slug: 'slugTeam',
    members_count: 1,
    project_groups: { edges: [{ node: { project_group_id: '1', title: 'title' } }] },
    projects: {
      edges: [{
        node: {
          title: 'title', dbid: 2, project_group_id: '1', id: 'ABJvamVjdC70\n',
        },
      }],
    },
  };

  const feed = {
    dbid: 1,
    name: 'Feed Name',
  };

  const cluster = {
    last_request_date: null,
    center: {
      title: 'Cluster one center title',
      media: {
        url: null,
        type: 'UploadedImage',
        picture: 'https://assets.checkmedia.org/image/1.png',
      },
    },
  };

  it('should render teams', () => {
    const wrapper = shallowWithIntl(<FeedItemTeams cluster={cluster} feed={feed} team={team} />);
    expect(wrapper.find('#feed-item-page-teams')).toHaveLength(1);
  });

  it('should render without crashing when center is null', () => {
    const clusterWithoutCenter = {
      ...cluster,
      center: null,
    };
    const wrapper = shallowWithIntl(<FeedItemTeams cluster={clusterWithoutCenter} feed={feed} team={team} />);
    expect(wrapper.find('#feed-item-page-teams')).toHaveLength(1);
  });
});
