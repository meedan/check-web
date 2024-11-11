import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import MediaTasks from './MediaTasks';
import MediaRequests from './MediaRequests';
import MediaSource from './MediaSource';
import MediaSuggestions from './Similarity/MediaSuggestions';
import MediaSecondaryBanner from './MediaSecondaryBanner';
import MediaArticles from '../article/MediaArticles';
import ErrorBoundary from '../error/ErrorBoundary';
import TabWrapper from '../cds/menus-lists-dialogs/TabWrapper';

const tabLabels = defineMessages({
  articles: {
    defaultMessage: 'Articles',
    description: 'Label for the Articles tab',
    id: 'mediaComponent.articles',
  },
  requests: {
    defaultMessage: 'Requests',
    description: 'Label for the Requests tab, as in requests from users',
    id: 'mediaComponent.requests',
  },
  suggestedMedia: {
    defaultMessage: 'Suggestions',
    description: 'Label for the "Suggestions" tab, to show a list of media items that are suggested as similar to the one the user is viewing',
    id: 'mediaComponent.suggestedMedia',
  },
  annotation: {
    defaultMessage: 'Annotations',
    description: 'Label for the Annotation tab',
    id: 'mediaComponent.annotation',
  },
  source: {
    defaultMessage: 'Source',
    description: 'Label for the Source tab, as in source of the information',
    id: 'mediaComponent.source',
  },
});

const MediaComponentRightPanel = ({
  intl,
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
      <TabWrapper
        className="media__annotations-tabs"
        tabs={[
          {
            label: intl.formatMessage(tabLabels.articles),
            show: showArticles,
            value: 'articles',
            className: 'media-tab__articles',
            extraLabel: projectMedia.articles_count > 0 ? ` [${projectMedia.articles_count}]` : '',
          },
          {
            label: intl.formatMessage(tabLabels.requests),
            show: showRequests,
            value: 'requests',
            className: 'media-tab__requests',
            extraLabel: projectMedia.demand > 0 ? ` [${projectMedia.demand}]` : '',
          },
          {
            label: intl.formatMessage(tabLabels.suggestedMedia),
            show: showSuggestions,
            value: 'suggestedMedia',
            className: 'media-tab__suggestedMedia',
            extraLabel: projectMedia.suggested_similar_items_count > 0 ? ` [${projectMedia.suggested_similar_items_count}]` : '',
          },
          {
            label: intl.formatMessage(tabLabels.annotation),
            show: showAnnotations,
            value: 'metadata',
            className: 'media-tab__metadata',
            extraLabel: '',
          },
          {
            label: intl.formatMessage(tabLabels.source),
            value: 'source',
            show: showSources,
            className: 'media-tab__source',
            extraLabel: '',
          },
        ]}
        value={showTab}
        onChange={setShowTab}
      />
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

export default injectIntl(MediaComponentRightPanel);
