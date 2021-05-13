import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@material-ui/icons/Delete';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckArchivedFlags from '../../CheckArchivedFlags';

export default function Trash({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    archived: CheckArchivedFlags.TRASHED,
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/trash`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="trash.title" defaultMessage="Trash" />}
      icon={<DeleteIcon />}
      teamSlug={routeParams.team}
      query={query}
      hideFields={['user']}
      page="trash"
    />
  );
}
Trash.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
