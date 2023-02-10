import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MediaRelationship from './MediaRelationship';
import MediaCardCondensed from '../../cds/media-cards/MediaCardCondensed';
import MediaItem from './MediaItem'; // eslint-disable-line no-unused-vars
import { can } from '../../Can';
import { brandLightCDS } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: -theme.spacing(2.5),
    left: -theme.spacing(2),
    opacity: 0,
    background: brandLightCDS,
    height: 0,
    width: `calc(100% + ${theme.spacing(4)}px)`,
    display: 'block',
    borderRadius: theme.spacing(2),
  },
}));

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target.requests_count - a.node.target.requests_count);
}

const MediaSimilaritiesComponent = ({ projectMedia, isHighlighting }) => {
  const classes = useStyles();

  return (
    <div className="media__more-medias" id="matched-media">
      <Box my={4}>
        <Typography variant="body">
          <strong>
            <FormattedMessage
              id="mediaSimilarities.moreMedias"
              defaultMessage="Media"
              description="Heading for a list of matched medias"
            />
          </strong>
        </Typography>
      </Box>
      <div className={classes.container}>
        <span className={`${classes.overlay} ${isHighlighting ? classes.animation : ''}`} id="matched-overlay" />
        {
          projectMedia.confirmed_similar_relationships?.edges?.length === 0 ? (
            <MediaCardCondensed
              placeholder={
                <Typography variant="body2">
                  <FormattedMessage
                    id="mediaSimilarities.noMedia"
                    defaultMessage="0 media"
                    description="A message that shows when the matched media list is empty."
                  />
                </Typography>
              }
            />
          ) : null
        }
        { sort(projectMedia.confirmed_similar_relationships?.edges).map(relationship => (
          <MediaRelationship
            key={relationship.node.id}
            relationship={relationship.node}
            canSwitch={can(projectMedia.permissions, 'update ProjectMedia')}
            canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
            mainProjectMediaId={projectMedia.id}
            mainProjectMediaDemand={projectMedia.demand}
            mainProjectMediaConfirmedSimilarCount={projectMedia.confirmedSimilarCount}
            relationshipSourceId={relationship.node.source_id}
            relationshipTargetId={relationship.node.target_id}
          />
        ))}
      </div>
    </div>
  );
};

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
            requests_count
            ...MediaItem_projectMedia
          }
        }
      }
    }
  }
`);
