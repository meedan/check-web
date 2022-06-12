import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckArchivedFlags from '../../CheckArchivedFlags';

export default function Spam({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    archived: CheckArchivedFlags.SPAM,
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };

  return (
    <ErrorBoundary component="Spam">
      <Search
        searchUrlPrefix={`/${routeParams.team}/spam`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="spam.title" defaultMessage="Spam" />}
        icon={<DeleteIcon />}
        teamSlug={routeParams.team}
        query={query}
        hideFields={['user', 'country', 'cluster_teams', 'cluster_published_reports', 'archived']}
        page="spam"
      />
    </ErrorBoundary>
  );
}
Spam.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
