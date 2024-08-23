import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '../../icons/delete.svg';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckArchivedFlags from '../../CheckArchivedFlags';

export default function Trash({ routeParams }) {
  const defaultQuery = {
    archived: CheckArchivedFlags.TRASHED,
    sort: 'recent_activity',
    sort_type: 'DESC',
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    ...defaultQuery,
  };

  return (
    <ErrorBoundary component="Trash">
      <Search
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'user', 'cluster_teams', 'cluster_published_reports', 'archived']}
        icon={<DeleteIcon />}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        page="trash"
        query={query}
        searchUrlPrefix={`/${routeParams.team}/trash`}
        teamSlug={routeParams.team}
        title={<FormattedMessage defaultMessage="Trash" description="Title for the trash listing of items" id="trash.title" />}
      />
    </ErrorBoundary>
  );
}
Trash.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
