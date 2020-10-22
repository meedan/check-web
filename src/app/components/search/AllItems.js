import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Search from './Search';
import { safelyParseJSON } from '../../helpers';

export default function AllItems({ routeParams }) {
  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/all-items`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="search.allClaimsTitle" defaultMessage="All items" />}
      query={safelyParseJSON(routeParams.query, {})}
      teamSlug={routeParams.team}
      fields={['date', 'status', 'project', 'tags', 'show', 'dynamic', 'sort', 'keyword', 'bulk']}
    />
  );
}
AllItems.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
