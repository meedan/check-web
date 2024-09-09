import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import FeedTopBar from './FeedTopBar';
import FeedHeader from './FeedHeader';
import FeedClusters from './FeedClusters';
import ErrorBoundary from '../error/ErrorBoundary';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import Search from '../search/Search';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import { safelyParseJSON } from '../../helpers';
import PageTitle from '../PageTitle';

export const FeedComponent = ({ routeParams, ...props }) => {
  const { team } = props;
  const { feed } = team;

  if (!feed) {
    browserHistory.push('/check/not-found');
    return null;
  }

  const feedTeam = feed.current_feed_team;
  const isFeedOwner = feedTeam.team_id === feed.team_id;

  // set initial teamFilters to list of all teams OR whatever is from the query
  const [teamFilters, setTeamFilters] = React.useState(feed?.teams?.edges.map(item => item.node.dbid));

  // Redirect to edit FeedTeam if we're not sharing a list and we're not the feed creator
  if (!isFeedOwner && feedTeam && !feedTeam.saved_search_id) {
    browserHistory.push(`/${routeParams.team}/feed/${feed.dbid}/edit`);
  }

  const commonSearchProps = {
    searchUrlPrefix: `/${routeParams.team}/feed/${feed.dbid}`,
    title: feed.name,
    extra: () => (
      <FeedTopBar
        feed={feed}
        setTeamFilters={setTeamFilters}
        team={team}
        teamFilters={teamFilters}
      />
    ),
    listSubtitle: <FormattedMessage defaultMessage="Shared Feed" description="Generic Label for the shared feed feature which is a collection of check work spaces contributing content to one place" id="global.sharedFeed" />,
    icon: <SharedFeedIcon />,
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
      <PageTitle prefix={feed.name} team={{ name: team.name }} >

        {/* Feed is sharing only fact-checks */}
        {feed.published && !feed.data_points?.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
          <div className="feed__fact-checks search-results-wrapper" id="feed__fact-checks">
            <Search
              defaultQuery={feed.filters}
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
                'verification_status',
              ]}
              mediaUrlPrefix="media"
              // if all filters are empty, force an empty result
              query={{
                ...safelyParseJSON(routeParams.query, {}),
                feed_team_ids: teamFilters,
                feed_id: feed.dbid,
                show: ['claims', 'links', 'twitter', 'youtube', 'tiktok', 'instagram', 'facebook', 'telegram', 'weblink', 'images', 'videos', 'audios', 'blank'],
                ...feed.filters,
              }}
              resultType={teamFilters.length === 0 ? 'emptyFeed' : 'factCheck'}
              {...commonSearchProps}
              listActions={
                <FeedHeader feed={feed} feedTeam={feedTeam} />
              }
              title={feed.name}
            />
          </div>
          : null
        }

        {/* Feed is sharing media */}
        {feed.published && feed.data_points?.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
          <div className="search-results-wrapper" id="feed__clusters">
            <FeedClusters
              feedId={parseInt(routeParams.feedId, 10)}
              teamSlug={routeParams.team}
            />
          </div>
          : null
        }

      </PageTitle>
    </React.Fragment>
  );
};

FeedComponent.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
  team: PropTypes.shape({
    feed: PropTypes.shape({
      dbid: PropTypes.number,
      name: PropTypes.string,
      published: PropTypes.bool,
      filters: PropTypes.object,
      teams_count: PropTypes.number,
      requests_count: PropTypes.number.isRequired,
      data_points: PropTypes.arrayOf(PropTypes.number),
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
            name
            feed(dbid: $feedId) {
              dbid
              team_id
              name
              published
              filters
              saved_search_id
              data_points
              teams(first: 1000) {
                edges {
                  node {
                    dbid
                    name
                  }
                }
              }
              current_feed_team {
                team_id
                saved_search_id
                filters
                ...FeedHeader_feedTeam
              }
              ...FeedTopBar_feed
              ...FeedHeader_feed
            }
            ...FeedTopBar_team
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return <FeedComponent routeParams={routeParams} {...props} />;
        }
        return null;
      }}
      variables={{
        slug: routeParams.team,
        feedId: parseInt(routeParams.feedId, 10),
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
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
  team: PropTypes.shape({
    feed: PropTypes.object.isRequired,
  }),
};

export default Feed;
