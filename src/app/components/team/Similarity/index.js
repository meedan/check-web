import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import SimilarityComponent from './SimilarityComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return <SimilarityComponent team={props.team} />;
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Similarity = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SimilarityQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          ...SimilarityComponent_team
        }
      }
    `}
    variables={{
      teamSlug: props.teamSlug,
    }}
    render={renderQuery}
  />
);

Similarity.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default Similarity;
