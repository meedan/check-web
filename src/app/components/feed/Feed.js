import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ErrorBoundary from '../error/ErrorBoundary';
import FeedRequestsTable from './FeedRequestsTable';
import FeedSharingSwitch from './FeedSharingSwitch';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

export const FeedComponent = ({ routeParams, ...props }) => {
  const { team } = props;
  const { feed } = team;
  const { tab } = routeParams;

  if (!feed) {
    browserHistory.push('/check/not-found');
    return null;
  }

  const feedTeam = feed.current_feed_team;

  // This component is displayed on top of the search filters
  const topBar = (query) => {
    const currentFeedTeamFilters = {};
    Object.keys(query).forEach((key) => {
      if (!Object.keys(feed.filters).includes(key) && key !== 'timestamp') {
        currentFeedTeamFilters[key] = query[key];
      }
    });
    const readOnlySwitcher = (!feedTeam.shared && (JSON.stringify(currentFeedTeamFilters) !== JSON.stringify(feedTeam.filters)));
    return (
      <React.Fragment>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          value={tab}
          onChange={(e, newTab) => { browserHistory.push(`/${routeParams.team}/feed/${feed.dbid}/${newTab}`); }} /* This way filters are easily reset */
        >
          <Tab
            label={
              <FormattedMessage
                id="feed.shared"
                defaultMessage="Shared"
                description="Tab with label 'Shared' displayed on a feed page. It references content from this workspace that is shared with others."
              />
            }
            value="shared"
          />
          { feedTeam.shared ?
            <Tab
              label={
                <FormattedMessage
                  id="feed.feed"
                  defaultMessage="Fact-checks"
                  description="Tab with label 'Feed' displayed on a feed page. It references content from different workspaces that is shared among them."
                />
              }
              value="feed"
            /> : null }
          { (feed.published && feedTeam.shared) ?
            <Tab
              label={
                <FormattedMessage
                  id="feed.requests"
                  defaultMessage="Requests"
                  description="Tab with label 'Requests' displayed on a feed page. It references all requests submitted to that feed."
                />
              }
              value="requests"
            /> : null }
        </Tabs>
        { tab === 'shared' ? <FeedSharingSwitch enabled={feedTeam.shared} feedTeamId={feedTeam.id} readOnly={readOnlySwitcher} numberOfWorkspaces={feed.teams_count} feedName={feed.name} /> : null }
      </React.Fragment>
    );
  };

  const commonSearchProps = {
    searchUrlPrefix: `/${routeParams.team}/feed/${feed.dbid}/${tab}`,
    title: feed.name,
    extra: topBar,
    icon: <DynamicFeedIcon />,
    teamSlug: routeParams.team,
    readOnlyFields: Object.keys(feed.filters),
    showExpand: true,
    page: 'feed',
  };

  let routeQuery = safelyParseJSON(routeParams.query, {});
  if (Object.keys(routeQuery).length === 0) {
    routeQuery = feedTeam.filters;
  }

  return (
    <React.Fragment>
      {/* The "Shared" tab just shows content from that workspace */}
      { tab === 'shared' ?
        <div id="feed__from-workspace">
          <Search
            mediaUrlPrefix="media"
            result
            query={{
              ...feed.filters,
              ...routeQuery,
            }}
            feedTeam={{
              id: feedTeam.id,
              filters: feedTeam.filters,
              feedFilters: feed.filters,
              shared: feedTeam.shared,
            }}
            hideFields={['cluster_teams', 'cluster_published_reports']}
            {...commonSearchProps}
          />
        </div>
        : null
      }

      {/* The "Feed" tab displays content from the feed itself */}

      {/* For a "published" feed, it's just all the fact-checks from the workspaces */}
      { tab === 'feed' && feed.published ?
        <div id="feed__fact-checks">
          <Search
            mediaUrlPrefix="media"
            query={{
              ...safelyParseJSON(routeParams.query, {}),
              feed_id: feed.dbid,
              ...feed.filters,
            }}
            resultType="factCheck"
            hideFields={[
              'folder',
              'projects',
              'project_group_id',
              'tags',
              'verification_status',
              'users',
              'assigned_to',
              'published_by',
              'team_tasks',
              'channels',
              'linked_items_count',
              'suggestions_count',
              'demand',
              'sources',
              'dynamic',
              'annotated_by',
              'language',
              'published_by',
              'has_claim',
              'cluster_published_reports',
              'cluster_teams',
              'archived',
              'read',
            ]}
            {...commonSearchProps}
          />
        </div>
        : null
      }

      {/* If it's not a "published" feed, then it's a clustered view from workspace data */}
      { tab === 'feed' && !feed.published ?
        <div id="feed__clusters">
          <Search
            mediaUrlPrefix={`/check/feed/${feed.dbid}`}
            query={{
              ...safelyParseJSON(routeParams.query, {}),
              sort: 'cluster_last_item_at',
              feed_id: feed.dbid,
              clusterize: true,
              ...feed.filters,
            }}
            resultType="feed"
            hideFields={[
              'folder',
              'projects',
              'project_group_id',
              'tags',
              'verification_status',
              'users',
              'assigned_to',
              'published_by',
              'team_tasks',
              'channels',
              'linked_items_count',
              'suggestions_count',
              'demand',
              'sources',
              'dynamic',
              'annotated_by',
              'language',
              'published_by',
              'has_claim',
              'cluster_published_reports',
              'cluster_teams',
              'archived',
              'read',
            ]}
            {...commonSearchProps}
          />
        </div>
        : null
      }

      { tab === 'requests' && feed.published ?
        <div id="feed__requests">
          <FeedRequestsTable
            tabs={topBar}
            teamSlug={routeParams.team}
            feedId={parseInt(routeParams.feedId, 10)}
            searchUrlPrefix={commonSearchProps.searchUrlPrefix}
            filters={{ ...safelyParseJSON(routeParams.query, {}) }}
          />
        </div>
        : null
      }
    </React.Fragment>
  );
};

FeedComponent.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
    tab: PropTypes.oneOf(['shared', 'feed', 'requests']),
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
  team: PropTypes.shape({
    feed: PropTypes.shape({
      dbid: PropTypes.number,
      name: PropTypes.string,
      published: PropTypes.bool,
      filters: PropTypes.object,
      teams_count: PropTypes.number,
      current_feed_team: PropTypes.shape({
        id: PropTypes.string,
        filters: PropTypes.object,
        shared: PropTypes.bool,
      }),
    }),
  }).isRequired,
};

const Feed = ({ routeParams }) => (
  <ErrorBoundary component="Feed">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedQuery($slug: String!, $feedId: Int!) {
          team(slug: $slug) {
            feed(dbid: $feedId) {
              dbid
              name
              published
              filters
              teams_count
              current_feed_team {
                id
                filters
                shared
              }
            }
          }
        }
      `}
      variables={{
        slug: routeParams.team,
        feedId: parseInt(routeParams.feedId, 10),
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return <FeedComponent routeParams={routeParams} {...props} />;
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

Feed.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
    tab: PropTypes.oneOf(['shared', 'feed', 'requests']),
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default Feed;
