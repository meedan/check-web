import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import PublishedIcon from '../../icons/playlist_add_check.svg';

const PublishedArticles = ({ routeParams }) => (
  <Articles
    articleTypeReadOnly
    defaultFilters={{ report_status: 'published' }}
    filterOptions={['users', 'tags', 'range', 'verification_status', 'language_filter', 'published_by']}
    icon={<PublishedIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Published" description="Title of the published articles page." id="publishedArticles.title" />}
    type="fact-check"
  />
);

PublishedArticles.defaultProps = {};

PublishedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default PublishedArticles;
