import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import MediaSimilarityBar from './MediaSimilarityBar';
import MediaItem from './MediaItem';
import MediaRequests from '../MediaRequests';
import { Column } from '../../../styles/js/shared';
import { can } from '../../Can';

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target.requests_count - a.node.target.requests_count);
}

let listener = null;

const MediaSimilaritiesComponent = ({ projectMedia }) => {
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
    <React.Fragment>
      <Column className="media__column">
        <MediaSimilarityBar projectMedia={projectMedia} />
        { projectMedia.confirmed_main_item ?
          <MediaItem projectMedia={projectMedia.confirmed_main_item} /> : null }
        <Box mt={4} mb={2}>
          <Typography variant="subtitle2">
            <FormattedMessage
              id="mediaSimilarities.allSimilarMedia"
              defaultMessage="All similar media"
            />
          </Typography>
        </Box>
        { sort(projectMedia.confirmed_similar_relationships.edges).map(relationship => (
          <MediaItem
            key={relationship.node.id}
            mainProjectMedia={projectMedia}
            projectMedia={relationship.node.target}
            relationship={relationship.node}
            canSwitch={can(projectMedia.permissions, 'update ProjectMedia')}
            canDelete={can(projectMedia.permissions, 'destroy ProjectMedia')}
            isSelected={relationship.node.target_id === selectedProjectMediaDbid}
            onSelect={handleSelectItem}
          />
        ))}
      </Column>
      <Column className="media__annotations-column">
        <Tabs indicatorColor="primary" textColor="primary" className="media__annotations-tabs" value="requests">
          <Tab
            label={
              <FormattedMessage
                id="mediaSimilarities.requests"
                defaultMessage="Requests"
              />
            }
            value="requests"
            className="media-tab__requests"
          />
        </Tabs>
        { selectedProjectMediaDbid ?
          <MediaRequests media={{ dbid: selectedProjectMediaDbid }} all={false} /> :
          <MediaRequests media={{ dbid: projectMedia.dbid }} all /> }
      </Column>
    </React.Fragment>
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
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(MediaSimilaritiesComponent, graphql`
  fragment MediaSimilaritiesComponent_projectMedia on ProjectMedia {
    id
    dbid
    permissions
    confirmed_main_item {
      id
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
    }
  }
`);
