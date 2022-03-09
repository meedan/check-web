import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ErrorIcon from '@material-ui/icons/Error';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckArchivedFlags from '../../CheckArchivedFlags';

export default function Unconfirmed({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    archived: CheckArchivedFlags.UNCONFIRMED,
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/unconfirmed`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="unconfirmed.title" defaultMessage="Unconfirmed" />}
      icon={<ErrorIcon />}
      teamSlug={routeParams.team}
      query={query}
      hideFields={['user', 'country', 'cluster_teams']}
      page="unconfirmed"
    />
  );
}
Unconfirmed.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
