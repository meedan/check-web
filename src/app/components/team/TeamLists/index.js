import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TeamListsComponent from './TeamListsComponent';

const TeamLists = () => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamListsQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            slug
            list_columns
            smooch_bot: team_bot_installation(bot_identifier: "smooch") {
              id
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={({ props }) => {
        if (props) {
          return (<TeamListsComponent team={props.team} />);
        }
        return null;
      }}
    />
  );
};

TeamLists.propTypes = {};

export default TeamLists;
