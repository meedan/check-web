/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import RulesComponent from './RulesComponent';
import settingsStyles from '../Settings.module.css';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <div className={settingsStyles['setting-details-wrapper']}><RulesComponent team={props.team} /></div>;
  }
  // TODO: We need a better error handling in the future, standardized with other components
  return null;
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
