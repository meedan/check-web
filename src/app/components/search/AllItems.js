import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Search from './Search';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import PermMediaIcon from '../../icons/perm_media.svg';

export default function AllItems({ routeParams }) {
  const defaultQuery = { sort: 'recent_activity' };
  return (
    <ErrorBoundary component="AllItems">
      <Search
        defaultQuery={defaultQuery}
        hideFields={[
          'cluster_teams', 'cluster_published_reports', 'feed_fact_checked_by',
        ]}
        icon={<PermMediaIcon />}
        listSubtitle={<FormattedMessage defaultMessage="Media Clusters List" description="Displayed on top of the tipline lists title on the search results page." id="search.tiplineSubHeader" />}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        page="all-items"
        query={safelyParseJSON(routeParams.query, defaultQuery)}
        searchUrlPrefix={`/${routeParams.team}/all-items`}
        teamSlug={routeParams.team}
        title={<FormattedMessage defaultMessage="All Media Clusters" description="Page title for listing all media items in check" id="search.allClaimsTitle" />}
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
