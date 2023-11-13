/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeed from './SaveFeed';

const EditFeedTeam = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query EditFeedTeamQuery($feedTeamId: ID!) {
        feed_team(id: $feedTeamId) {
          team {
            dbid
          }
          feed {
            ...SaveFeed_feed
          }
        }
      }
    `}
    variables={{
      feedTeamId: parseInt(routeParams.feedTeamId, 10),
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (
          <SaveFeed
            feedTeam={props?.feed_team}
            feed={props?.feed_team?.feed || {}}
            // This is ugly
            // I'm think even Feed editing should be done
            // from the perspective of a FeedTeam.
          />
        );
      }
      return null;
    }}
  />
);

export default EditFeedTeam;
