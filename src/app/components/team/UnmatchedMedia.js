import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import UnmatchedIcon from '../../icons/unmatched.svg';

const defaultFilters = {
  unmatched: ['1'],
};

const UnmatchedMedia = ({ routeParams }) => {
  const defaultQuery = {
    ...defaultFilters,
    sort: 'recent_activity',
    sort_type: 'DESC',
  };
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    ...defaultQuery,
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/unmatched-media`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="unmatchedMedia.title" defaultMessage="Unmatched media" description="Title of the unmatched media list page" />}
      icon={<UnmatchedIcon />}
      teamSlug={routeParams.team}
      query={query}
      defaultQuery={defaultQuery}
      hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
      readOnlyFields={['unmatched']}
      page="unmatched-media"
    />
  );
};

UnmatchedMedia.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export { defaultFilters as unmatchedMediaDefaultQuery };

export default UnmatchedMedia;
