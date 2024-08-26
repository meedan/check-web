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
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'user', 'cluster_teams', 'cluster_published_reports', 'archived']}
        icon={<SpamIcon />}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        page="spam"
        query={query}
        searchUrlPrefix={`/${routeParams.team}/spam`}
        teamSlug={routeParams.team}
        title={
          <FormattedMessage
            defaultMessage="Spam"
            description="Spam, as in junk, unsolicited content"
            id="spam.title"
          />
        }
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
