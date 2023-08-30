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
        searchUrlPrefix={`/${routeParams.team}/trash`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="trash.title" defaultMessage="Trash" description="Title for the trash listing of items" />}
        icon={<DeleteIcon />}
        teamSlug={routeParams.team}
        query={query}
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'user', 'cluster_teams', 'cluster_published_reports', 'archived']}
        page="trash"
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
