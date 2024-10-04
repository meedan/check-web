import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import DrawerListCounter from './DrawerListCounter';

const ProjectsCoreListCounter = ({ query }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ProjectsCoreListCounterQuery($query: String!) {
        search(query: $query) {
          number_of_results
        }
      }
    `}
    render={({ props }) => {
      if (props) {
        return (<DrawerListCounter numberOfItems={props.search.number_of_results} />);
      }
      return null;
    }}
    variables={{
      query: JSON.stringify(query),
    }}
  />
);

ProjectsCoreListCounter.propTypes = {
  query: PropTypes.object.isRequired, // CheckSearch JSON query
};

export default ProjectsCoreListCounter;
