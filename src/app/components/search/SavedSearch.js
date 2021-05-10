import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';
import ProjectActions from '../drawer/Projects/ProjectActions';

const SavedSearch = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SavedSearchQuery($id: ID!) {
        saved_search(id: $id) {
          id
          dbid
          title
          filters
          team {
            id
            slug
            permissions
          }
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
              listActions={
                <ProjectActions
                  noDescription
                  object={props.saved_search}
                  name={<FormattedMessage id="savedSearch.name" defaultMessage="list" />}
                  updateMutation={graphql`
                    mutation SavedSearchUpdateSavedSearchMutation($input: UpdateSavedSearchInput!) {
                      updateSavedSearch(input: $input) {
                        saved_search {
                          title
                        }
                      }
                    }
                  `}
                  deleteMessage={
                    <FormattedMessage
                      id="savedSearch.deleteMessage"
                      defaultMessage="Are you sure? This list is shared among all users of Check demo. After deleting it, no user will be able to access it."
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
              title={props.saved_search.title}
              teamSlug={routeParams.team}
              query={query}
              hideFields={['read', 'project']}
              page="list"
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
