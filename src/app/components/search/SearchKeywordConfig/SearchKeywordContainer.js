import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchKeywordConfigComponent from './SearchKeywordConfigComponent';

const SearchKeywordContainer = ({
  teamSlug,
  onDismiss,
  onSubmit,
  query,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchKeywordContainerQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          metadata: team_tasks(first: 10000, fieldset: "metadata") {
            edges {
              node {
                id,
                dbid,
                associated_type,
                label,
                type,
              }
            }
          }
          tasks: team_tasks(first: 10000, fieldset: "tasks") {
            edges {
              node {
                id,
                dbid,
                associated_type,
                label,
                type,
              }
            }
          }
        }
      }
    `}
    variables={{
      teamSlug,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (
          <SearchKeywordConfigComponent
            team={props.team}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
            query={query}
          />
        );
      }

      if (!error && !props) {
        return (<CircularProgress />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

SearchKeywordContainer.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default SearchKeywordContainer;
