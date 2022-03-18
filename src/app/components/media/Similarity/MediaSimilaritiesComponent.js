import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import MediaItem from './MediaItem';
import MediaExpanded from '../MediaExpanded';
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
        <Dialog open maxWidth="sm" fullWidth>
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
        <MediaItem
          key={relationship.node.id}
          mainProjectMedia={projectMedia}
          team={projectMedia.team}
          projectMedia={relationship.node.target}
          relationship={relationship.node}
          canSwitch={can(projectMedia.permissions, 'update ProjectMedia')}
          canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
          isSelected={relationship.node.target_id === selectedProjectMediaDbid}
          showReportStatus={false}
          onSelect={handleSelectItem}
          modalOnly
        />
      ))}
    </div>
  );
};

MediaSimilaritiesComponent.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired,
    confirmed_main_item: PropTypes.object.isRequired,
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
    team: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
      smooch_bot: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(MediaSimilaritiesComponent, graphql`
  fragment MediaSimilaritiesComponent_projectMedia on ProjectMedia {
    id
    dbid
    demand
    permissions
    confirmedSimilarCount: confirmed_similar_items_count
    confirmed_main_item {
      id
      dbid
      ...MediaItem_projectMedia
    }
    confirmed_similar_relationships(first: 10000) {
      edges {
        node {
          id
          dbid
          source_id
          target_id
          target {
            requests_count
            ...MediaItem_projectMedia
          }
        }
      }
    }
    team {
      dbid
      smooch_bot: team_bot_installation(bot_identifier: "smooch") {
        id
      }
    }
  }
`);
