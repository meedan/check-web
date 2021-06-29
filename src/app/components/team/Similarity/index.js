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
    variables={{
      teamSlug,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return <SimilarityComponent user={props.me} team={props.team} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

Similarity.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Similarity;
