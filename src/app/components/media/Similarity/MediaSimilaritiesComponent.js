import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import MediaSimilarityBar from './MediaSimilarityBar';
import MediaItem from './MediaItem';
import MediaRequests from '../MediaRequests';
import MediaComments from '../MediaComments';
import { Column } from '../../../styles/js/shared';
import { can } from '../../Can';
import { isBotInstalled } from '../../../helpers';

function sort(items) {
  if (!items) {
    return [];
  }
  return items.slice().sort((a, b) => b.node.target.requests_count - a.node.target.requests_count);
}

let listener = null;

const MediaSimilaritiesComponent = ({ projectMedia }) => {
  const [selectedProjectMediaDbid, setSelectedProjectMediaDbid] = React.useState(null);
  const itemUrl = window.location.pathname.replace(/\/similar-media$/, '');

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

  const handleGoBack = () => {
    browserHistory.push(itemUrl);
  };

  return (
    <React.Fragment>
      <Column className="media__column">
        <Button startIcon={<IconArrowBack />} onClick={handleGoBack} size="small">
          <FormattedMessage
            id="mediaSimilaritiesComponent.back"
            defaultMessage="Back"
          />
        </Button>
        <MediaSimilarityBar projectMedia={projectMedia} />
        { projectMedia.confirmed_main_item ?
          <React.Fragment>
            <Box mt={2} mb={2}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="mediaSimilarities.mainItem"
                  defaultMessage="Main media"
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
        { isBotInstalled(projectMedia.team, 'smooch') ?
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
      team_bot_installations: PropTypes.shape({
        edges: PropTypes.arrayOf(PropTypes.shape({
          node: PropTypes.shape({
            team_bot: PropTypes.shape({
              identifier: PropTypes.string,
            }),
          }),
        })).isRequired,
      }).isRequired,
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
      team_bot_installations(first: 10000) {
        edges {
          node {
            team_bot: bot_user {
              identifier
            }
          }
        }
      }
    }
  }
`);
