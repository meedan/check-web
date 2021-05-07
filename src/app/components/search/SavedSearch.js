import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

const SavedSearch = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SavedSearchQuery($id: ID!) {
        saved_search(id: $id) {
          dbid
          title
          filters
        }
      }
    `}
    variables={{
      id: routeParams.savedSearchId,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        const savedQuery = props.saved_search.filters || {};
        const query = {
          ...savedQuery,
          ...safelyParseJSON(routeParams.query, {}),
        };

        return (
          <div className="saved-search">
            <Search
              searchUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              title={props.saved_search.title}
              teamSlug={routeParams.team}
              query={query}
              hideFields={['read', 'project']}
            />
          </div>
        );
      }
      return null;
    }}
  />
);

SavedSearch.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    savedSearchId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default SavedSearch;
