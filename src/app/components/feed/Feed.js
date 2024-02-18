import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import FeedRequestsTable from './FeedRequestsTable';
import FeedTopBar from './FeedTopBar';
import FeedHeader from './FeedHeader';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

export const FeedComponent = ({ routeParams, ...props }) => {
  const { team } = props;
  const { feed } = team;

  if (!feed) {
    browserHistory.push('/check/not-found');
    return null;
  }

  const tab = routeParams.tab || 'feed';
  const feedTeam = feed.current_feed_team;
  const isFeedOwner = feedTeam.team_id === feed.team_id;

  // set initial teamFilters to list of all teams OR whatever is from the query
  const [teamFilters, setTeamFilters] = React.useState(feed?.teams?.edges.map(item => item.node.dbid));

  // Redirect to edit FeedTeam if we're not sharing a list and we're not the feed creator
  if (!isFeedOwner && feedTeam && !feedTeam.saved_search_id) {
    browserHistory.push(`/${routeParams.team}/feed/${feed.dbid}/edit`);
  }

  const commonSearchProps = {
    searchUrlPrefix: `/${routeParams.team}/feed/${feed.dbid}/${tab}`,
    title: feed.name,
    extra: () => (
      <FeedTopBar
        team={team}
        feed={feed}
        teamFilters={teamFilters}
        setTeamFilters={setTeamFilters}
      />
    ),
    listSubtitle: <FormattedMessage id="feedHeader.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed page." />,
    icon: null,
    teamSlug: routeParams.team,
    readOnlyFields: Object.keys(feed.filters),
    showExpand: true,
    page: 'feed',
    feed: {
      dbid: feed.dbid,
      saved_search_id: feed.saved_search_id,
    },
  };

  let routeQuery = safelyParseJSON(routeParams.query, {});
  if (Object.keys(routeQuery).length === 0) {
    routeQuery = feedTeam.filters;
  }

  return (
    <React.Fragment>
      {/* The "Shared" tab just shows content from that workspace */}
      { tab === 'shared' ?
        <div id="feed__from-workspace" className="search-results-wrapper">
          <Search
            mediaUrlPrefix="media"
            result
            query={{
              ...feed.filters,
              ...routeQuery,
            }}
            defaultQuery={feed.filters}
            feedTeam={{
              id: feedTeam.id,
              filters: feedTeam.filters,
              feedFilters: feed.filters,
              shared: feedTeam.shared,
            }}
            hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
            {...commonSearchProps}
          />
        </div>
        : null
      }

      {/* The "Feed" tab displays content from the feed itself */}

      {/* For a "published" feed, it's just all the fact-checks from the workspaces */}
      { tab === 'feed' && feed.published ?
        <div id="feed__fact-checks" className="feed__fact-checks search-results-wrapper">
          <Search
            mediaUrlPrefix="media"
            query={{
              ...safelyParseJSON(routeParams.query, {}),
              feed_team_ids: teamFilters,
              feed_id: feed.dbid,
              ...feed.filters,
            }}
            defaultQuery={feed.filters}
            // if all filters are empty, force an empty result
            resultType={teamFilters.length === 0 ? 'emptyFeed' : 'factCheck'}
            hideFields={[
              'feed_fact_checked_by',
              'tags',
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
              'report_status',
              'show',
              'unmatched',
            ]}
            {...commonSearchProps}
            title={feed.name}
            listActions={
              <FeedHeader feedTeam={feedTeam} feed={feed} />
            }
          />
        </div>
        : null
      }

      {/* If it's not a "published" feed, then it's a clustered view from workspace data */}
      { tab === 'feed' && !feed.published ?
        <div id="feed__clusters" className="search-results-wrapper">
          <p>Deprecated.</p>
        </div>
        : null
      }

      { tab === 'requests' && feed.published ?
        <div id="feed__requests">
          <FeedRequestsTable
            tabs={null}
            teamSlug={routeParams.team}
            feedId={parseInt(routeParams.feedId, 10)}
            feedTeam={{
              id: feedTeam.id,
              requests_filters: feedTeam.requests_filters || {},
            }}
            searchUrlPrefix={commonSearchProps.searchUrlPrefix}
            filters={
              routeParams.query ?
                { ...safelyParseJSON(routeParams.query, {}) } :
                (feedTeam.requests_filters || {})
            }
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
              team_id
              name
              published
              filters
              saved_search_id
              teams(first: 1000) {
                edges {
                  node {
                    id
                    dbid
                    name
                  }
                }
              }
              current_feed_team {
                id
                team_id
                saved_search_id
                filters
                shared
                requests_filters
                ...FeedHeader_feedTeam
              }
              ...FeedTopBar_feed
              ...FeedHeader_feed
            }
            ...FeedTopBar_team
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

Feed.defaultProps = {
  team: null,
};

Feed.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
    tab: PropTypes.oneOf(['shared', 'feed', 'requests']),
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
  team: PropTypes.shape({
    feed: PropTypes.object.isRequired,
  }),
};

export default Feed;
