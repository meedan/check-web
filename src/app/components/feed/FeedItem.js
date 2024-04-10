import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import NotFound from '../NotFound';
import FeedItemHeader from './FeedItemHeader';
import FeedItemTeams from './FeedItemTeams';

const FeedItemComponent = ({
  feed,
  cluster,
  team,
}) => (
  <div id="feed-item-page">
    <FeedItemHeader
      team={team}
      feed={feed}
      cluster={cluster}
    />
    <FeedItemTeams
      feed={feed}
      team={team}
      cluster={cluster}
    />
  </div>
);

FeedItemComponent.propTypes = {
  feed: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedItemComponent };

const FeedItem = ({ routeParams }) => (
  <ErrorBoundary component="FeedItem">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedItemQuery($slug: String!, $feedId: Int!, $projectMediaId: Int!) {
          team(slug: $slug) {
            ...FeedItemTeams_team
            ...FeedItemHeader_team
            feed(dbid: $feedId) {
              ...FeedItemHeader_feed
              ...FeedItemTeams_feed
              cluster(project_media_id: $projectMediaId) {
                ...FeedItemHeader_cluster
                ...FeedItemTeams_cluster
              }
            }
          }
        }
      `}
      variables={{
        slug: routeParams.team,
        feedId: parseInt(routeParams.feedId, 10),
        projectMediaId: parseInt(routeParams.projectMediaId, 10),
      }}
      render={({ props, error }) => {
        if (props && !error) {
          const cluster = props.team?.feed?.cluster;
          if (cluster) {
            return (<FeedItemComponent feed={props.team.feed} cluster={cluster} team={props.team} />);
          }
          return (<NotFound />);
        }
        return <MediasLoading theme="white" variant="page" size="large" />;
      }}
    />
  </ErrorBoundary>
);

FeedItem.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
    feedId: PropTypes.number.isRequired,
    projectMediaId: PropTypes.number.isRequired,
  }).isRequired,
};

export default FeedItem;
