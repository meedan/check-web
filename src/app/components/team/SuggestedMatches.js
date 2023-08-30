import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import LightbulbIcon from '../../icons/lightbulb.svg';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';

const SuggestedMatches = ({ routeParams }) => {
  const defaultQuery = {
    suggestions_count: { min: 1 },
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
        searchUrlPrefix={`/${routeParams.team}/suggested-matches`}
        mediaUrlPrefix={`/${routeParams.team}/media`}
        title={
          <FormattedMessage
            id="suggestedMatches.title"
            defaultMessage="Suggestions"
            description="Header for suggested media page"
          />
        }
        icon={<LightbulbIcon />}
        teamSlug={routeParams.team}
        query={query}
        defaultQuery={defaultQuery}
        hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
        readOnlyFields={['suggestions_count']}
        page="suggested-matches"
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

export default SuggestedMatches;
