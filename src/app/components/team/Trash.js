import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';

export default function Trash({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    archived: 1,
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
      teamSlug={routeParams.team}
      query={query}
      hideFields={['read', 'user']}
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
