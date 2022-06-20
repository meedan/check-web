/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import GetAppIcon from '@material-ui/icons/GetApp';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';

export default function ImportedReports({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    channels: [CheckChannels.FETCH],
  };

  return (
    <ErrorBoundary component="ImportedReports">
      <Search
        searchUrlPrefix={`/${routeParams.team}/imported-reports`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="ImportedReports.title" defaultMessage="Imported reports" />}
        icon={<GetAppIcon />}
        teamSlug={routeParams.team}
        query={query}
        hideFields={['channels', 'country', 'cluster_teams', 'cluster_published_reports']}
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
