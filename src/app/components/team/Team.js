import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TeamComponent from './TeamComponent';

const renderQuery = ({ error, props }, { route, params }) => {
  if (!error && props) {
    return <TeamComponent team={props.team} route={route} params={params} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Team = (props) => {
  const teamSlug = props.params.team || '';

  if (teamSlug === '') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            ...TeamComponent_team
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={data => renderQuery(data, props)}
    />
  );
};

export default Team;
