import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import MediaRelationship from './MediaRelationship';
import { can } from '../../Can';
import styles from './MediaSimilarities.module.css';

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target?.requests_count - a.node.target?.requests_count);
}

const MediaSimilaritiesComponent = ({ projectMedia }) => (
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
        relationshipp={relationship.node}
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
          ...MediaRelationship_relationshipp
          id
          target {
            requests_count
          }
        }
      }
    }
  }
`);
