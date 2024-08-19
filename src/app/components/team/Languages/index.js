/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import LanguagesComponent from './LanguagesComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <LanguagesComponent team={props.team} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Languages = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query LanguagesQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          ...LanguagesComponent_team
        }
      }
    `}
    render={renderQuery}
    variables={{
      teamSlug: props.teamSlug,
    }}
  />
);

Languages.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Languages;
