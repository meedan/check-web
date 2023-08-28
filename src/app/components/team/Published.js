import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import PublishedIcon from '../../icons/playlist_add_check.svg';

const Published = ({ routeParams }) => {
  const defaultQuery = {
    report_status: ['published'],
    sort: 'recent_activity',
    sort_type: 'DESC',
  };

  const query = {
    ...defaultQuery,
    ...safelyParseJSON(routeParams.query, {}),
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/published`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="published.title" defaultMessage="Published" description="Title of the Published list page" />}
      icon={<PublishedIcon />}
      teamSlug={routeParams.team}
      query={query}
      defaultQuery={defaultQuery}
      hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
      readOnlyFields={['report_status']}
      page="published"
    />
  );
};

Published.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default Published;
