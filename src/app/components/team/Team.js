import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TeamComponent from './TeamComponent';
import ErrorBoundary from '../error/ErrorBoundary';

const renderQuery = ({ error, props }, { params, route }) => {
  if (!error && props) {
    return <TeamComponent params={params} route={route} team={props.team} />;
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
    <ErrorBoundary component="Team">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query TeamQuery($teamSlug: String!) {
            team(slug: $teamSlug) {
              ...TeamComponent_team
            }
          }
        `}
        render={data => renderQuery(data, props)}
        variables={{
          teamSlug,
          timestamp: new Date().getTime(), // FIXME: Forcing re-fetching data from the backend since Relay Modern mutations with file uploads don't update the Relay store yet
        }}
      />
    </ErrorBoundary>
  );
};

export default Team;
