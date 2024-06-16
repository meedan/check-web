import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import MediaTasks from './MediaTasks';
import MediaRequests from './MediaRequests';
import MediaSource from './MediaSource';
import MediaSuggestions from './Similarity/MediaSuggestions';
import ArticlesSidebar from '../article/ArticlesSidebar';
import ErrorBoundary from '../error/ErrorBoundary';

const MediaComponentRightPanel = ({
  projectMedia,
  setShowTab,
  showTab,
  superAdminMask,
}) => {
  const { team_bots: teamBots } = projectMedia.team;
  const enabledBots = teamBots.edges.map(b => b.node.login);
  const showRequests = (enabledBots.indexOf('smooch') > -1 || projectMedia.requests_count > 0);
  const showSuggestions = (!projectMedia.is_suggested && !projectMedia.is_confirmed_similar_to_another_item);
  const showArticles = true; // FIXME: Set based on a feature flag?

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
        { showArticles && (
          <Tab
            label={
              <FormattedMessage
                id="mediaComponent.articles"
                defaultMessage="Articles"
                description="Label for the Articles tab"
              />
            }
            value="articles"
            className="media-tab__articles"
          />
        )}
        { showRequests ?
          <Tab
            label={
              <span>
                <FormattedMessage
                  id="mediaComponent.requests"
                  defaultMessage="Requests"
                  description="Label for the Requests tab, as in requests from users"
                />
                {projectMedia.demand > 0 && ` [${projectMedia.demand}]`}
              </span>
            }
            value="requests"
            className="media-tab__requests"
          />
          : null }
        { showSuggestions ?
          <Tab
            label={
              <span>
                <FormattedMessage
                  id="mediaComponent.suggestedMedia"
                  defaultMessage="Suggestions"
                  description="Label for the 'Suggestions' tab, to show a list of media items that are suggested as similar to the one the user is viewing"
                />
                {projectMedia.suggested_similar_items_count > 0 && ` [${projectMedia.suggested_similar_items_count}]`}
              </span>
            }
            value="suggestedMedia"
            className="media-tab__sugestedMedia"
          /> : null }
        <Tab
          label={
            <FormattedMessage
              id="mediaComponent.annotation"
              defaultMessage="Annotations"
              description="Label for the Annotation tab"
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
              description="Label for the Source tab, as in source of the information"
            />
          }
          value="source"
          className="media-tab__source"
        />
      </Tabs>
      { showTab === 'requests' ? <MediaRequests media={projectMedia} all={!projectMedia.is_confirmed_similar_to_another_item} /> : null }
      { showTab === 'suggestedMedia' ? <MediaSuggestions dbid={projectMedia.dbid} teamDbid={projectMedia.team?.dbid} superAdminMask={superAdminMask} /> : null }
      { showTab === 'metadata' ? <MediaTasks media={projectMedia} fieldset="metadata" /> : null }
      { showTab === 'source' ? <MediaSource projectMedia={projectMedia} /> : null }
      { showTab === 'articles' ? <ArticlesSidebar teamSlug={projectMedia.team.slug} projectMediaDbid={projectMedia.dbid} /> : null }
    </ErrorBoundary>
  );
};

MediaComponentRightPanel.propTypes = {
  projectMedia: PropTypes.object.isRequired, // FIXME: Detail which fields are expected
  setShowTab: PropTypes.func.isRequired, // React useState setter
  showTab: PropTypes.string.isRequired, // React useState state
  superAdminMask: PropTypes.bool,
};

MediaComponentRightPanel.defaultProps = {
  superAdminMask: false,
};

export default MediaComponentRightPanel;
