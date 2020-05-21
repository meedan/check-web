import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import RulesComponent from './RulesComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <RulesComponent team={props.team} />;
  }
  return null; // We need a better error handling in the future, standardized with other components
};

const Rules = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query RulesQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          get_rules
          rules_json_schema
        }
      }
    `}
    variables={{
      teamSlug: props.teamSlug,
    }}
    render={renderQuery}
  />
);

Rules.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Rules;
