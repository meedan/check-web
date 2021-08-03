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
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/imported-reports`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="ImportedReports.title" defaultMessage="Imported reports" />}
      icon={<GetAppIcon />}
      teamSlug={routeParams.team}
      query={query}
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
