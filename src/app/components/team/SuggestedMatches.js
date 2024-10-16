import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import LightbulbIcon from '../../icons/lightbulb.svg';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';

const defaultFilters = {
  suggestions_count: { min: 1 },
};

const SuggestedMatches = ({ routeParams }) => {
  const defaultQuery = {
    ...defaultFilters,
    sort: 'recent_added',
    sort_type: 'DESC',
  };
  const query = {
    ...defaultQuery,
    ...safelyParseJSON(routeParams.query, {}),
  };
  return (
    <ErrorBoundary component="SuggestedMatches">
      <Search
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
        icon={<LightbulbIcon />}
        listSubtitle={<FormattedMessage defaultMessage="Media Clusters List" description="Displayed on top of the tipline lists title on the search results page." id="search.tiplineSubHeader" />}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        page="suggested-matches"
        query={query}
        readOnlyFields={['suggestions_count']}
        searchUrlPrefix={`/${routeParams.team}/suggested-matches`}
        teamSlug={routeParams.team}
        title={
          <FormattedMessage
            defaultMessage="Suggestions"
            description="Header for suggested media page"
            id="suggestedMatches.title"
          />
        }
      />
    </ErrorBoundary>
  );
};

SuggestedMatches.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export { defaultFilters as suggestedMatchesDefaultQuery };
export default SuggestedMatches;
