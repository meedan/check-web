/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import MediaRelationship from './MediaRelationship'; // eslint-disable-line import/no-named-as-default-member
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard'; // eslint-disable-line no-unused-vars
import MediaFeedInformation from '../MediaFeedInformation'; // eslint-disable-line no-unused-vars
import { can } from '../../Can';
import styles from './MediaSimilarities.module.css';

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target?.requests_count - a.node.target?.requests_count);
}

const MediaSimilaritiesComponent = ({ projectMedia, superAdminMask }) => (
  <div className={cx('media__more-medias', styles['similar-matched-media-list'])} id="matched-media">
    <span id="matched-overlay" />
    { sort(projectMedia.confirmed_similar_relationships?.edges).map(relationship => (
      <MediaRelationship
        canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
        canSwitch={can(projectMedia.permissions, 'update ProjectMedia')}
        key={relationship.node.id}
        mainProjectMediaConfirmedSimilarCount={projectMedia.confirmedSimilarCount}
        mainProjectMediaDemand={projectMedia.demand}
        mainProjectMediaId={projectMedia.id}
        relationship={relationship.node}
        relationshipSourceId={relationship.node.source_id}
        relationshipTargetId={relationship.node.target_id}
        superAdminMask={superAdminMask}
      />
    ))}
  </div>
);

MediaSimilaritiesComponent.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    demand: PropTypes.number.isRequired,
    confirmedSimilarCount: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired,
    confirmed_similar_relationships: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          dbid: PropTypes.number.isRequired,
          source_id: PropTypes.number.isRequired,
          target_id: PropTypes.number.isRequired,
          target: PropTypes.object.isRequired,
        }).isRequired,
      })).isRequired,
    }).isRequired,
  }).isRequired,
  superAdminMask: PropTypes.bool,
};

MediaSimilaritiesComponent.defaultProps = {
  superAdminMask: false,
};

// eslint-disable-next-line import/no-unused-modules
export { MediaSimilaritiesComponent };

export default createFragmentContainer(MediaSimilaritiesComponent, graphql`
  fragment MediaSimilaritiesComponent_projectMedia on ProjectMedia {
    id
    demand
    permissions
    confirmedSimilarCount: confirmed_similar_items_count
    confirmed_similar_relationships(first: 10000) {
      edges {
        node {
          id
          source_id
          target_id
          target {
            id
            dbid
            title
            description
            picture
            type
            last_seen
            requests_count
            linked_items_count
            report_status
            added_as_similar_by_name
            show_warning_cover
            confirmed_as_similar_by_name
            is_confirmed_similar_to_another_item
            url
            quote
            imported_from_feed_id
            imported_from_project_media_id
            ...MediaFeedInformation_projectMedia
            media {
              ...SmallMediaCard_media
            }
          }
        }
      }
    }
  }
`);
