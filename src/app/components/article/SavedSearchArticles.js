/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Articles from './Articles';
import SavedSearchActions from '../drawer/Projects/SavedSearchActions';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import ListIcon from '../../icons/list.svg';

const SavedSearchArticles = ({ routeParams }) => (
  <ErrorBoundary component="SavedSearch">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SavedSearchArticleshQuery($id: ID!) {
          saved_search(id: $id) {
            id
            dbid
            title
            filters
            list_type
            medias_count: items_count
            team {
              id
              slug
              name
              permissions
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          // Weird Relay error happens here if "filters" is a JSON object instead of a JSON string...
          // "Uncaught TypeError: Cannot assign to read only property '<filter name>' of object '#<Object>'"
          const defaultQuery = safelyParseJSON(props.saved_search.filters, {});
          const query = routeParams.query ? safelyParseJSON(routeParams.query, {}) : defaultQuery;

          return (
            <Articles
              defaultFilters={defaultQuery}
              filterOptions={['users', 'tags', 'range', 'verification_status', 'language_filter', 'published_by', 'channels']}
              icon={<ListIcon />}
              listActions={
                <SavedSearchActions
                  savedSearch={props.saved_search}
                />
              }
              pageName="articles"
              query={query}
              savedSearch={props.saved_search}
              teamSlug={routeParams.team}
              title={props.saved_search?.title}
            />
          );
        }
        return null;
      }}
      variables={{
        id: routeParams.savedSearchId,
        timestamp: new Date().getTime(), // Invalidate Relay cache
      }}
    />
  </ErrorBoundary>
);

SavedSearchArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    savedSearchId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default SavedSearchArticles;
