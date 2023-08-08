import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeed from './SaveFeed';

const EditFeed = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query EditFeedQuery($slug: String!, $feedId: Int!) {
        team(slug: $slug) {
          feed(dbid: $feedId) {
            ...SaveFeed_feed
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
        return (
          <SaveFeed feed={props?.team?.feed || {}} />
        );
      }
      return null;
    }}
  />
);

export default EditFeed;
