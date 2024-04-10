/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import Alert from '../cds/alerts-and-prompts/Alert';
import { safelyParseJSON } from '../../helpers';
import ProjectActions from '../drawer/Projects/ProjectActions';

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
      variables={{
        id: routeParams.savedSearchId,
        timestamp: new Date().getTime(), // Invalidate Relay cache
      }}
      render={({ error, props }) => {
        if (!error && props) {
          // Weird Relay error happens here if "filters" is a JSON object instead of a JSON string...
          // "Uncaught TypeError: Cannot assign to read only property '<filter name>' of object '#<Object>'"
          const defaultQuery = safelyParseJSON(props.saved_search.filters, {});
          const query = routeParams.query ? safelyParseJSON(routeParams.query, {}) : defaultQuery;

          return (
            <div className="saved-search search-results-wrapper">
              <Search
                searchUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}`}
                mediaUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}/media`}
                listActions={
                  <ProjectActions
                    object={props.saved_search}
                    updateMutation={graphql`
                      mutation SavedSearchUpdateSavedSearchMutation($input: UpdateSavedSearchInput!) {
                        updateSavedSearch(input: $input) {
                          saved_search {
                            id
                            title
                            medias_count: items_count
                          }
                        }
                      }
                    `}
                    deleteMessage={
                      props.saved_search?.is_part_of_feeds ?
                        <>
                          <FormattedHTMLMessage
                            tagName="p"
                            id="savedSearch.deleteMessageWarning"
                            defaultMessage="Are you sure? This is shared among all users of <strong>{teamName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                            description="A message that appears when a user tries to delete a list, warning them that it will affect other users in their workspace."
                            values={{
                              teamName: props.saved_search?.team ? props.saved_search.team.name : '',
                            }}
                          />
                          <Alert
                            variant="warning"
                            title={
                              <FormattedHTMLMessage
                                id="saveFeed.deleteCustomListWarning"
                                defaultMessage="<strong>Deleting list will result in no content for the following shared feeds:</strong>"
                                description="Warning displayed on edit feed page when no list is selected."
                              />
                            }
                            content={
                              <ul className="bulleted-list">
                                {props.saved_search?.feeds?.edges.map(feed => (
                                  <li key={feed.node.id}>{feed.node.name}</li>
                                ))}
                              </ul>
                            }
                          />
                        </>
                        :
                        <FormattedHTMLMessage
                          tagName="p"
                          id="savedSearch.deleteMessage"
                          defaultMessage="Are you sure? This is shared among all users of <strong>{teamName}</strong>. After deleting it, no user will be able to access it."
                          description="A message that appears when a user tries to delete a list, warning them that it will affect other users in their workspace."
                          values={{
                            teamName: props.saved_search?.team ? props.saved_search.team.name : '',
                          }}
                        />
                    }
                    deleteMutation={graphql`
                      mutation SavedSearchDestroySavedSearchMutation($input: DestroySavedSearchInput!) {
                        destroySavedSearch(input: $input) {
                          deletedId
                          team {
                            id
                          }
                        }
                      }
                    `}
                  />
                }
                title={props.saved_search?.title}
                listSubtitle={<FormattedMessage id="savedSearch.subtitle" defaultMessage="Custom List" description="Displayed on top of the custom list title on the search results page." />}
                teamSlug={routeParams.team}
                query={query}
                defaultQuery={defaultQuery}
                savedSearch={props.saved_search}
                hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
                page="list"
              />
            </div>
          );
        }
        return null;
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
