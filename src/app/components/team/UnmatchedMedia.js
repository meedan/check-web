import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import UnmatchedIcon from '../../icons/unmatched.svg';

const UnmatchedMedia = ({ routeParams }) => {
  const query = {
    unmatched: [1],
    sort: 'recent_activity',
    sort_type: 'DESC',
    ...safelyParseJSON(routeParams.query, {}),
  };
  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/unmatched-media`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="unmatchedMedia.title" defaultMessage="Unmatched media" description="Title of the unmatched media list page" />}
      icon={<UnmatchedIcon />}
      teamSlug={routeParams.team}
      query={query}
      hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
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

export default UnmatchedMedia;
