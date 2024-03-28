import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Search from './Search';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import CategoryIcon from '../../icons/category.svg';

export default function AllItems({ routeParams }) {
  // Adding sort key to defaultQuery breaks optimisticUpdate and appending new item to list
  // const defaultQuery = { sort: 'recent_activity' };
  const defaultQuery = {};
  return (
    <ErrorBoundary component="AllItems">
      <Search
        searchUrlPrefix={`/${routeParams.team}/all-items`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={<FormattedMessage id="search.allClaimsTitle" defaultMessage="All items" description="Page title for listing all items in check" />}
        query={safelyParseJSON(routeParams.query, defaultQuery)}
        defaultQuery={defaultQuery}
        icon={<CategoryIcon />}
        teamSlug={routeParams.team}
        hideFields={[
          'cluster_teams', 'cluster_published_reports', 'feed_fact_checked_by',
        ]}
        page="all-items"
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
