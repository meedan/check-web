/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ListIcon from '@material-ui/icons/List';
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
            name
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
        // Weird Relay error happens here if "filters" is a JSON object instead of a JSON string...
        // "Uncaught TypeError: Cannot assign to read only property '<filter name>' of object '#<Object>'"
        const savedQuery = props.saved_search.filters || '{}';
        const query = routeParams.query ?
          safelyParseJSON(routeParams.query, {}) :
          safelyParseJSON(savedQuery, {});

        return (
          <div className="saved-search">
            <Search
              searchUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}`}
              mediaUrlPrefix={`/${routeParams.team}/list/${routeParams.savedSearchId}/media`}
              icon={<ListIcon />}
              listActions={
                <ProjectActions
                  noDescription
                  object={props.saved_search}
                  objectType="SavedSearch"
                  name={<FormattedMessage id="savedSearch.name" defaultMessage="list" />}
                  updateMutation={graphql`
                    mutation SavedSearchUpdateSavedSearchMutation($input: UpdateSavedSearchInput!) {
                      updateSavedSearch(input: $input) {
                        saved_search {
                          id
                          title
                        }
                      }
                    }
                  `}
                  deleteMessage={
                    <FormattedMessage
                      id="savedSearch.deleteMessage"
                      defaultMessage="Are you sure? This list is shared among all users of {teamName}. After deleting it, no user will be able to access it."
                      values={{ teamName: props.saved_search.team ? props.saved_search.team.name : '' }}
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
              savedSearch={props.saved_search}
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
