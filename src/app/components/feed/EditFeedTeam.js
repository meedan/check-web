import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeed from './SaveFeed';
import { safelyParseJSON } from '../../helpers';

const EditFeedTeam = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query EditFeedTeamQuery($feedId: Int, $teamSlug: String) {
        feed_team(feedId: $feedId, teamSlug: $teamSlug) {
          ...SaveFeed_feedTeam
        }
        team {
          permissions
        }
      }
    `}
    variables={{
      feedId: parseInt(routeParams.feedId, 10),
      teamSlug: routeParams.team,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SaveFeed feedTeam={props.feed_team} permissions={safelyParseJSON(props.team.permissions)} />);
      }
      return null;
    }}
  />
);

export default EditFeedTeam;
