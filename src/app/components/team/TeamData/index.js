import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TeamDataComponent from './TeamDataComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <TeamDataComponent data={props.team.data_report} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const TeamData = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TeamDataQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          data_report
        }
      }
    `}
    variables={{
      teamSlug: props.teamSlug,
    }}
    render={renderQuery}
  />
);

TeamData.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TeamData;
