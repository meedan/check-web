import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import PublishedIcon from '../../icons/playlist_add_check.svg';
import CheckArticleTypes from '../../constants/CheckArticleTypes';

const PublishedArticles = ({ routeParams }) => (
  <Articles
    defaultFilters={{ article_type: CheckArticleTypes.FACTCHECK, report_status: 'published' }}
    filterOptions={['users', 'tags', 'range', 'verification_status', 'language_filter', 'published_by', 'channels']}
    icon={<PublishedIcon />}
    pageName="published"
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Published" description="Title of the published articles page." id="publishedArticles.title" />}
  />
);

PublishedArticles.defaultProps = {};

PublishedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default PublishedArticles;
