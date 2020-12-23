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
            list_columns
            team_bot_installations(first: 10000) {
              edges {
                node {
                  team_bot: bot_user {
                    identifier
                  }
                }
              }
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
