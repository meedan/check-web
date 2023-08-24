/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';
import FileDownloadIcon from '../../icons/file_download.svg';

export default function ImportedReports({ routeParams }) {
  const defaultQuery = {
    channels: [CheckChannels.FETCH],
  };
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    ...defaultQuery,
  };

  return (
    <ErrorBoundary component="ImportedReports">
      <Search
        searchUrlPrefix={`/${routeParams.team}/imported-fact-checks`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="ImportedReports.title" defaultMessage="Imported fact-checks" />}
        icon={<FileDownloadIcon />}
        teamSlug={routeParams.team}
        query={query}
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
        readOnlyFields={['channels']}
        page="imported-reports"
      />
    </ErrorBoundary>
  );
}
ImportedReports.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
