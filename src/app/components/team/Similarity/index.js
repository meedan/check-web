/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import SimilarityComponent from './SimilarityComponent';

const Similarity = ({ teamSlug }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SimilarityQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          ...SimilarityComponent_team
        }
        me {
          is_admin
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return <SimilarityComponent team={props.team} user={props.me} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
    variables={{
      teamSlug,
    }}
  />
);

Similarity.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Similarity;
