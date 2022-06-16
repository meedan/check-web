/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Search from './Search';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';

export default function AllItems({ routeParams }) {
  return (
    <ErrorBoundary component="AllItems">
      <Search
        searchUrlPrefix={`/${routeParams.team}/all-items`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="search.allClaimsTitle" defaultMessage="All items" />}
        query={safelyParseJSON(routeParams.query, {})}
        teamSlug={routeParams.team}
        hideFields={[
          'country', 'cluster_teams', 'cluster_published_reports',
        ]}
      />
    </ErrorBoundary>
  );
}
AllItems.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
