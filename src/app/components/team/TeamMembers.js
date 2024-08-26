import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TeamMembersComponent from './TeamMembersComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <TeamMembersComponent team={props.team} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const TeamMembers = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TeamMembersQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          ...TeamMembersComponent_team
        }
      }
    `}
    render={renderQuery}
    variables={{
      teamSlug: props.teamSlug,
    }}
  />
);

TeamMembers.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TeamMembers;
