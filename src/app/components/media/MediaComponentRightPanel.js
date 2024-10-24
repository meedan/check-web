import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import cx from 'classnames/bind';
import MediaTasks from './MediaTasks';
import MediaRequests from './MediaRequests';
import MediaSource from './MediaSource';
import MediaSuggestions from './Similarity/MediaSuggestions';
import MediaSecondaryBanner from './MediaSecondaryBanner';
import MediaArticles from '../article/MediaArticles';
import ErrorBoundary from '../error/ErrorBoundary';
import styles from './media.module.css';

const MediaComponentRightPanel = ({
  projectMedia,
  setShowTab,
  showTab,
  superAdminMask,
}) => {
  const { team_bots: teamBots } = projectMedia.team;
  const isSecondary = Boolean(projectMedia.is_suggested || projectMedia.is_confirmed_similar_to_another_item);
  const enabledBots = teamBots.edges.map(b => b.node.login);
  const showRequests = (enabledBots.indexOf('smooch') > -1 || projectMedia.requests_count > 0);
  const showSuggestions = !isSecondary;
  const showArticles = !isSecondary;
  const showSources = !isSecondary;
  const showAnnotations = !isSecondary;

  return (
    <ErrorBoundary component="MediaComponentRightPanel">
      <MediaSecondaryBanner projectMedia={projectMedia} />
      <Tabs
        className={cx('media__annotations-tabs', styles['media-item-column-header'])}
        indicatorColor="primary"
        scrollButtons="auto"
        textColor="primary"
        value={showTab}
        variant="scrollable"
        onChange={(e, value) => setShowTab(value)}
      >
        { showArticles && (
          <Tab
            className="media-tab__articles"
            label={
              <span>
                <FormattedMessage
                  defaultMessage="Articles"
                  description="Label for the Articles tab"
                  id="mediaComponent.articles"
                />
                {projectMedia.articles_count > 0 && ` [${projectMedia.articles_count}]`}
              </span>
            }
            value="articles"
          />
        )}
        { showRequests && (
          <Tab
            className="media-tab__requests"
            label={
              <span>
                <FormattedMessage
                  defaultMessage="Requests"
                  description="Label for the Requests tab, as in requests from users"
                  id="mediaComponent.requests"
                />
                {projectMedia.demand > 0 && ` [${projectMedia.demand}]`}
              </span>
            }
            value="requests"
          />
        )}
        { showSuggestions && (
          <Tab
            className="media-tab__sugestedMedia"
            label={
              <span>
                <FormattedMessage
                  defaultMessage="Suggestions"
                  description="Label for the 'Suggestions' tab, to show a list of media items that are suggested as similar to the one the user is viewing"
                  id="mediaComponent.suggestedMedia"
                />
                {projectMedia.suggested_similar_items_count > 0 && ` [${projectMedia.suggested_similar_items_count}]`}
              </span>
            }
            value="suggestedMedia"
          />
        )}
        { showAnnotations && (
          <Tab
            className="media-tab__metadata"
            label={
              <FormattedMessage
                defaultMessage="Annotations"
                description="Label for the Annotation tab"
                id="mediaComponent.annotation"
              />
            }
            value="metadata"
          />
        )}
        { showSources && (
          <Tab
            className="media-tab__source"
            label={
              <FormattedMessage
                defaultMessage="Source"
                description="Label for the Source tab, as in source of the information"
                id="mediaComponent.source"
              />
            }
            value="source"
          />
        )}
      </Tabs>
      { showTab === 'requests' ? <MediaRequests all={!projectMedia.is_confirmed_similar_to_another_item} media={projectMedia} /> : null }
      { showTab === 'suggestedMedia' ? <MediaSuggestions dbid={projectMedia.dbid} superAdminMask={superAdminMask} teamDbid={projectMedia.team?.dbid} /> : null }
      { showTab === 'metadata' ? <MediaTasks fieldset="metadata" media={projectMedia} /> : null }
      { showTab === 'source' ? <MediaSource projectMedia={projectMedia} /> : null }
      { showTab === 'articles' ? <MediaArticles projectMediaDbid={projectMedia.dbid} teamSlug={projectMedia.team.slug} /> : null }
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
