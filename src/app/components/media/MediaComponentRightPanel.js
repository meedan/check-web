import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import MediaTasks from './MediaTasks';
import MediaComments from './MediaComments';
import MediaRequests from './MediaRequests';
import MediaSource from './MediaSource';
import ErrorBoundary from '../error/ErrorBoundary';

const MediaComponentRightPanel = ({ projectMedia }) => {
  const { team_bots: teamBots } = projectMedia.team;
  const enabledBots = teamBots.edges.map(b => b.node.login);
  const showRequests = (enabledBots.indexOf('smooch') > -1 || projectMedia.requests_count > 0);

  const [showTab, setShowTab] = React.useState(showRequests ? 'requests' : 'metadata');

  return (
    <ErrorBoundary component="MediaComponentRightPanel">
      <Tabs
        indicatorColor="primary"
        onChange={(e, value) => setShowTab(value)}
        scrollButtons="auto"
        textColor="primary"
        variant="scrollable"
        value={showTab}
        className="media__annotations-tabs"
      >
        { showRequests ?
          <Tab
            label={
              <FormattedMessage
                id="mediaComponent.requests"
                defaultMessage="Requests"
              />
            }
            value="requests"
            className="media-tab__requests"
          />
          : null }
        <Tab
          label={
            <FormattedMessage
              id="mediaComponent.annotation"
              defaultMessage="Annotation"
            />
          }
          value="metadata"
          className="media-tab__metadata"
        />
        <Tab
          label={
            <FormattedMessage
              id="mediaComponent.source"
              defaultMessage="Source"
            />
          }
          value="source"
          className="media-tab__source"
        />
        <Tab
          label={
            <FormattedMessage
              id="mediaComponent.notes"
              defaultMessage="Notes"
            />
          }
          value="notes"
          className="media-tab__comments"
        />
      </Tabs>
      { /* Set maxHeight to screen height - (media bar + tabs) */ }
      <Box maxHeight="calc(100vh - 112px)" style={{ overflowY: 'auto' }}>
        { showTab === 'requests' ? <MediaRequests media={projectMedia} all={!projectMedia.is_confirmed_similar_to_another_item} /> : null }
        { showTab === 'metadata' ? <MediaTasks media={projectMedia} fieldset="metadata" /> : null }
        { showTab === 'source' ? <MediaSource projectMedia={projectMedia} /> : null }
        { showTab === 'notes' ? <MediaComments media={projectMedia} /> : null }
      </Box>
    </ErrorBoundary>
  );
};

MediaComponentRightPanel.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
};

export default MediaComponentRightPanel;
