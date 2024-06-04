import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { FeedItemHeader } from './FeedItemHeader';

describe('<FeedItemHeader />', () => {
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

  const team = {
    id: '1',
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

  it('should render header', () => {
    const wrapper = shallowWithIntl(<FeedItemHeader team={team} teamSlug="test" feed={feed} cluster={cluster} />);
    expect(wrapper.find('#feed-item-page-header')).toHaveLength(1);
  });

  it('should render header when center is null', () => {
    const clusterWithoutCenter = {
      ...cluster,
      center: null,
    };
    const wrapper = shallowWithIntl(<FeedItemHeader team={team} teamSlug="test" feed={feed} cluster={clusterWithoutCenter} />);
    expect(wrapper.find('#feed-item-page-header')).toHaveLength(1);
  });
});
