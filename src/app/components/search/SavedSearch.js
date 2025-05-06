/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import ListIcon from '../../icons/list.svg';
import { safelyParseJSON } from '../../helpers';
import SavedSearchActions from '../drawer/Projects/SavedSearchActions';

const SavedSearch = ({ routeParams }) => (
  <ErrorBoundary component="SavedSearch">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SavedSearchQuery($id: ID!) {
          saved_search(id: $id) {
            id
            dbid
            title
            filters
            list_type
            feeds(first: 100) {
              edges {
                node {
                  name
                  id
                }
              }
            }
            is_part_of_feeds
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
            <div className="saved-search search-results-wrapper">
              <Search
                defaultQuery={defaultQuery}
                hideFields={[
                  'feed_fact_checked_by',
                  'cluster_teams',
                  'cluster_published_reports',
                  'published_by',
                  'article_type',
                ]}
                icon={<ListIcon />}
                listActions={
                  <SavedSearchActions
                    savedSearch={props.saved_search}
                  />
                }
                listSubtitle={<FormattedMessage defaultMessage="Custom Media Clusters List" description="Displayed on top of the custom list title on the search results page." id="savedSearch.subtitle" />}
                mediaUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}/media`}
                page="list"
                query={query}
                savedSearch={props.saved_search}
                searchUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}`}
                teamSlug={routeParams.team}
                title={props.saved_search?.title}
              />
            </div>
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

SavedSearch.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    savedSearchId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default SavedSearch;
