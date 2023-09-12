import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import PersonIcon from '../../icons/person.svg';

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
          const query = {
            ...defaultFilters,
            assigned_to: [props.me.dbid],
          };
          return (
            <Search
              searchUrlPrefix={`/${routeParams.team}/assigned-to-me`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              title={<FormattedMessage id="assignedTo.title" defaultMessage="Assigned to me" description="Title of the 'assigned to me' list page. It lists items assigned to the current user" />}
              icon={<PersonIcon />}
              teamSlug={routeParams.team}
              query={query}
              defaultQuery={defaultFilters}
              hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_AssignedToMe_reports']}
              readOnlyFields={['assigned_to']}
              page="assigned-to-me"
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
