import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import GetAppIcon from '@material-ui/icons/GetApp';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';

export default function ImportedReports({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    channels: [CheckChannels.FETCH],
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/imported-reports`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="ImportedReports.title" defaultMessage="Imported reports" />}
      icon={<GetAppIcon />}
      teamSlug={routeParams.team}
      query={query}
      hideFields={['channels', 'country', 'cluster_teams']}
      page="imported-reports"
    />
  );
}
ImportedReports.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
