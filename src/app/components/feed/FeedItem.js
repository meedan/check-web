/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import FeedItemHeader from './FeedItemHeader';
import FeedItemTeams from './FeedItemTeams';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import NotFound from '../NotFound';
import PageTitle from '../PageTitle';

const FeedItemComponent = ({
  cluster,
  feed,
  team,
}) => (
  <PageTitle prefix={`${team?.feed?.cluster?.title} | ${feed?.name}`} team={{ name: team?.name }}>
    <div id="feed-item-page">
      <FeedItemHeader
        cluster={cluster}
        feed={feed}
        team={team}
      />
      <FeedItemTeams
        cluster={cluster}
        feed={feed}
        team={team}
      />
    </div>
  </PageTitle>
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
            name
            ...FeedItemTeams_team
            ...FeedItemHeader_team
            feed(dbid: $feedId) {
              name
              ...FeedItemHeader_feed
              ...FeedItemTeams_feed
              cluster(project_media_id: $projectMediaId) {
                title
                ...FeedItemHeader_cluster
                ...FeedItemTeams_cluster
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (props && !error) {
          const cluster = props.team?.feed?.cluster;
          if (cluster) {
            return (<FeedItemComponent cluster={cluster} feed={props.team.feed} team={props.team} />);
          }
          return (<NotFound />);
        }
        return <Loader size="large" theme="white" variant="page" />;
      }}
      variables={{
        slug: routeParams.team,
        feedId: parseInt(routeParams.feedId, 10),
        projectMediaId: parseInt(routeParams.projectMediaId, 10),
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
