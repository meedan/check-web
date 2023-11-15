/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeedTeam from './SaveFeedTeam';

const EditFeedTeam = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query EditFeedTeamQuery($feedTeamId: ID!) {
        feed_team(id: $feedTeamId) {
          ...SaveFeedTeam_feedTeam
        }
      }
    `}
    variables={{
      feedTeamId: parseInt(routeParams.feedTeamId, 10),
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SaveFeedTeam feedTeam={props.feed_team} />);
      }
      return null;
    }}
  />
);

export default EditFeedTeam;
