import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { TrendingUp as TrendingUpIcon } from '@material-ui/icons';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

const Trends = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TrendsQuery($slug: String!) {
        team(slug: $slug) {
          id
          get_trends_filters
        }
      }
    `}
    variables={{
      slug: routeParams.team,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        const { team } = props;
        const savedQuery = team.get_trends_filters || {};
        let query = {};
        if (typeof routeParams.query === 'undefined' && Object.keys(savedQuery).length > 0) {
          query = { ...savedQuery };
        } else {
          query = {
            sort: 'cluster_last_item_at',
            ...safelyParseJSON(routeParams.query, {}),
          };
        }
        query.trends = true;
        query.country = true;
        return (
          <Search
            searchUrlPrefix={`/${routeParams.team}/trends`}
            mediaUrlPrefix="media"
            title={<FormattedMessage id="trends.title" defaultMessage="Shared database" />}
            icon={<TrendingUpIcon />}
            query={query}
            teamSlug={routeParams.team}
            showExpand
            resultType="trends"
            hideFields={[
              'folder',
              'projects',
              'project_group_id',
              'tags',
              'read',
              'verification_status',
              'users',
              'assigned_to',
              'team_tasks',
              'range',
              'channels',
              'linked_items_count',
              'suggestions_count',
              'demand',
              'sources',
              'dynamic',
            ]}
          />
        );
      }
      return null;
    }}
  />
);

Trends.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default Trends;
