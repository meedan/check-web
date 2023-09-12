import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SpamIcon from '../../icons/report.svg';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckArchivedFlags from '../../CheckArchivedFlags';

export default function Spam({ routeParams }) {
  const defaultQuery = {
    archived: CheckArchivedFlags.SPAM,
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
    <ErrorBoundary component="Spam">
      <Search
        searchUrlPrefix={`/${routeParams.team}/spam`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={
          <FormattedMessage
            id="spam.title"
            defaultMessage="Spam"
            description="Spam, as in junk, unsolicited content"
          />
        }
        icon={<SpamIcon />}
        teamSlug={routeParams.team}
        query={query}
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'user', 'cluster_teams', 'cluster_published_reports', 'archived']}
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
