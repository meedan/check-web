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
  const defaultSort = {
    sort: 'recent_activity',
    sort_type: 'DESC',
  };
  const query = {
    ...defaultSort,
    ...safelyParseJSON(routeParams.query, {}),
    ...defaultFilters,
  };

  return (
    <Search
      defaultQuery={{ ...defaultFilters, ...defaultSort }}
      hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
      icon={<UnmatchedIcon />}
      listSubtitle={<FormattedMessage defaultMessage="Media Clusters List" description="Displayed on top of the tipline lists title on the search results page." id="search.tiplineSubHeader" />}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      page="unmatched-media"
      query={query}
      readOnlyFields={['unmatched']}
      searchUrlPrefix={`/${routeParams.team}/unmatched-media`}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Unmatched Media Clusters" description="Title of the unmatched media list page" id="unmatchedMedia.title" />}
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
