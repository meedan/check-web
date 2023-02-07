/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';

const SuggestedMatches = ({ routeParams }) => (
  <ErrorBoundary component="SuggestedMatches">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SuggestedMatchesQuery($slug: String!) {
          team(slug: $slug) {
            id
            get_suggested_matches_filters
          }
        }
      `}
      variables={{
        slug: routeParams.team,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const { team } = props;
          const savedQuery = team.get_suggested_matches_filters || {};
          let query = {};
          if (typeof routeParams.query === 'undefined' && Object.keys(savedQuery).length > 0) {
            query = { ...savedQuery };
          } else {
            query = {
              suggestions_count: { min: 1 },
              sort: 'recent_added',
              sort_type: 'DESC',
              ...safelyParseJSON(routeParams.query, {}),
            };
          }
          return (
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
              icon={<NewReleasesIcon />}
              teamSlug={routeParams.team}
              query={query}
              hideFields={['feed_fact_checked_by', 'suggestions_count', 'cluster_teams', 'cluster_published_reports']}
              page="suggested-matches"
            />
          );
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

SuggestedMatches.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default SuggestedMatches;
