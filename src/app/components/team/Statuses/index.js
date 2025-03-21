import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import StatusesComponent from './StatusesComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <StatusesComponent team={props.team} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Statuses = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query StatusesQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          ...StatusesComponent_team
        }
      }
    `}
    render={renderQuery}
    variables={{
      teamSlug: props.teamSlug,
    }}
  />
);

Statuses.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Statuses;
