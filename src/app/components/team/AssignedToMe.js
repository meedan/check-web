import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import PersonIcon from '../../icons/person.svg';
import { safelyParseJSON } from '../../helpers';

const defaultFilters = {
  sort: 'recent_activity',
  sort_type: 'DESC',
};

const AssignedToMe = ({ routeParams }) => (
  <ErrorBoundary component="AssignedToMe">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query AssignedToMeQuery {
          me {
            dbid
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          const defaultQuery = {
            ...defaultFilters,
            assigned_to: [props.me.dbid],
          };
          const query = {
            ...defaultQuery,
            ...safelyParseJSON(routeParams.query, {}),
          };
          return (
            <Search
              defaultQuery={defaultQuery}
              hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_AssignedToMe_reports']}
              icon={<PersonIcon />}
              listSubtitle={<FormattedMessage defaultMessage="Media Clusters List" description="Displayed on top of the tipline lists title on the search results page." id="search.tiplineSubHeader" />}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              page="assigned-to-me"
              query={query}
              readOnlyFields={['assigned_to']}
              searchUrlPrefix={`/${routeParams.team}/assigned-to-me`}
              teamSlug={routeParams.team}
              title={<FormattedMessage defaultMessage="Media Clusters Assigned to Me" description="Title of the 'assigned to me' list page. It lists items assigned to the current user" id="assignedTo.title" />}
            />
          );
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

AssignedToMe.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export { defaultFilters as assignedToMeDefaultQuery };
export default AssignedToMe;
