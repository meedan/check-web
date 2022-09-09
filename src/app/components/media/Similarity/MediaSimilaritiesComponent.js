/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import MediaRelationship from './MediaRelationship';
import MediaExpanded from '../MediaExpanded';
import MediaItem from './MediaItem'; // eslint-disable-line no-unused-vars
import { can } from '../../Can';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target.requests_count - a.node.target.requests_count);
}

const swallowClick = (ev) => {
  // Don't close Dialog when clicking on it
  ev.stopPropagation();
};

let listener = null;

const MediaSimilaritiesComponent = ({ projectMedia }) => {
  const classes = useStyles();
  const [selectedProjectMediaDbid, setSelectedProjectMediaDbid] = React.useState(null);

  listener = () => {
    setSelectedProjectMediaDbid(null);
  };

  React.useEffect(() => {
    window.addEventListener('click', listener, false);
    return () => {
      window.removeEventListener('click', listener, false);
    };
  });

  const handleSelectItem = (newSelectedProjectMediaDbid) => {
    setSelectedProjectMediaDbid(newSelectedProjectMediaDbid);
  };

  return (
    <div className="media__more-medias">
      { selectedProjectMediaDbid ?
        <Dialog
          open={selectedProjectMediaDbid}
          onClick={swallowClick}
          onClose={() => setSelectedProjectMediaDbid(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent classes={classes}>
            <MediaExpanded media={{ dbid: selectedProjectMediaDbid }} hideActions />
          </DialogContent>
        </Dialog>
        : null }
      <Box my={2}>
        <Typography variant="body">
          <strong>
            <FormattedMessage
              id="mediaSimilarities.moreMedias"
              defaultMessage="More medias"
              description="Heading for a list of similar medias"
            />
          </strong>
        </Typography>
      </Box>
      { sort(projectMedia.confirmed_similar_relationships.edges).map(relationship => (
        <MediaRelationship
          key={relationship.node.id}
          relationship={relationship.node}
          canSwitch={can(projectMedia.permissions, 'update ProjectMedia')}
          canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
          isSelected={relationship.node.target_id === selectedProjectMediaDbid}
          handleSelectItem={handleSelectItem}
          mainProjectMediaId={projectMedia.id}
          mainProjectMediaDemand={projectMedia.demand}
          mainProjectMediaConfirmedSimilarCount={projectMedia.confirmedSimilarCount}
          relationshipSourceId={relationship.node.source_id}
          relationshipTargetId={relationship.node.target_id}
        />
      ))}
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
