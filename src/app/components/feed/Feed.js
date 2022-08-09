/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { TrendingUp as TrendingUpIcon } from '@material-ui/icons';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

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
          const { team } = props;
          const { feed } = team;
          if (!feed) {
            browserHistory.push('/check/not-found');
          }
          const query = {
            ...safelyParseJSON(routeParams.query, {}),
            sort: 'cluster_last_item_at',
            feed_id: feed.dbid,
            clusterize: true,
          };
          return (
            <Search
              searchUrlPrefix={`/${routeParams.team}/feed/${feed.dbid}`}
              mediaUrlPrefix={`/check/feed/${feed.dbid}`}
              title={feed.name}
              icon={<TrendingUpIcon />}
              query={query}
              teamSlug={routeParams.team}
              showExpand
              resultType="feed"
              hideFields={[
                'folder',
                'projects',
                'project_group_id',
                'tags',
                'read',
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
              ]}
            />
          );
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
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default Feed;
