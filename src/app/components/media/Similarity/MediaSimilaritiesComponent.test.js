import React from 'react';
import { MediaSimilaritiesComponent } from './MediaSimilaritiesComponent';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<MediaSimilaritiesComponent />', () => {
  it('should render without errors even if requests_count is null', () => {
    const permissions = JSON.stringify({ 'update Team': true, 'read Team': true });
    const projectMedia = {
      id: '1',
      demand: 1,
      confirmedSimilarCount: 1,
      permissions,
      confirmed_similar_relationships: {
        edges: [
          {
            node: {
              id: '1',
              dbid: 1,
              source_id: 1,
              target_id: 1,
              target: {
                media_cluster_origin: 1,
                media_cluster_origin_user: {
                  name: 'test User',
                },
              }
            },
          },
          {
            node: {
              id: '2',
              dbid: 2,
              source_id: 1,
              target_id: 1,
              media_cluster_origin: 1,
              media_cluster_origin_user: {
                name: 'test User',
              },
            },
          },
        ],
      },
    };

    const wrapper = shallowWithIntl(
      <MediaSimilaritiesComponent
        projectMedia={projectMedia}
      />,
    );

    expect(wrapper.find('.media__more-medias')).toHaveLength(1);
  });
});
