import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import MediaSimilarityBar from './MediaSimilarityBar';
import MediaItem from './MediaItem';
import MediaRequests from '../MediaRequests';
import MediaComments from '../MediaComments';
import { Column, black54 } from '../../../styles/js/shared';
import { can } from '../../Can';

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target.requests_count - a.node.target.requests_count);
}

const useStyles = makeStyles(() => ({
  similarityTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: black54,
  },
}));

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
    <React.Fragment>
      <Column className="media__column">
        <MediaSimilarityBar projectMedia={projectMedia} showSuggestionsCount={false} showBackButton />
        { projectMedia.confirmed_main_item ?
          <React.Fragment>
            <Box mt={2}>
              <Typography variant="subtitle2" className={classes.similarityTitle}>
                <FormattedMessage
                  id="mediaSimilarities.mainItem"
                  defaultMessage="Main"
                  description="Adjective, singular. Refers to the main item, as opposed to other similar items"
                />
              </Typography>
            </Box>
            <MediaItem
              team={projectMedia.team}
              projectMedia={projectMedia.confirmed_main_item}
              mainProjectMedia={projectMedia.confirmed_main_item}
              isSelected={projectMedia.confirmed_main_item.dbid === selectedProjectMediaDbid}
              onSelect={handleSelectItem}
            />
          </React.Fragment> : null }
        <Box mt={4}>
          <Typography variant="subtitle2" className={classes.similarityTitle}>
            <FormattedMessage
              id="mediaSimilarities.allSimilarMedia"
              defaultMessage="Similar"
              description="Adjective, plural. Heading for a list of similar items"
            />
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
          />
        ))}
      </Column>
      <Column className="media__annotations-column" overflow="hidden">
        { projectMedia.team.smooch_bot ?
          <React.Fragment>
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
            { /* Set maxHeight to screen height - (media bar + tabs) */ }
            <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
              { selectedProjectMediaDbid ?
                <MediaRequests media={{ dbid: selectedProjectMediaDbid }} all={false} /> :
                <MediaRequests media={{ dbid: projectMedia.dbid }} all />
              }
            </Box>
          </React.Fragment> :
          <React.Fragment>
            <Tabs indicatorColor="primary" textColor="primary" className="media__annotations-tabs" value="notes">
              <Tab
                label={
                  <FormattedMessage
                    id="mediaSimilarities.notes"
                    defaultMessage="Notes"
                  />
                }
                value="notes"
                className="media-tab__notes"
              />
            </Tabs>
            { /* Set maxHeight to screen height - (media bar + tabs) */ }
            <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
              { selectedProjectMediaDbid ?
                <MediaComments media={{ dbid: selectedProjectMediaDbid }} /> :
                <Box m={1}>
                  <Typography variant="subtitle2">
                    <FormattedMessage
                      id="mediaSimilarities.clickOnItem"
                      defaultMessage="Click on an item"
                    />
                  </Typography>
                </Box>
              }
            </Box>
          </React.Fragment>
        }
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
      ...MediaItem_team
      smooch_bot: team_bot_installation(bot_identifier: "smooch") {
        id
      }
    }
  }
`);
