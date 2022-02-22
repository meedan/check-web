import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TrendingUp as TrendingUpIcon } from '@material-ui/icons';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

export default function Trends({ routeParams }) {
  const query = {
    sort: 'cluster_last_item_at',
    show_similar: true,
    ...safelyParseJSON(routeParams.query, {}),
    trends: true,
    country: true,
  };
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
Trends.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
