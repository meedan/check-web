import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import DescriptionIcon from '../../icons/description.svg';

const AllArticles = ({ routeParams }) => (
  <Articles
    articleTypeReadOnly={false}
    defaultFilters={{ article_type: null }}
    filterOptions={['users', 'tags', 'range']}
    icon={<DescriptionIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="All Articles" description="Title of the all articles page." id="allArticles.title" />}
    type={null}
  />
);

AllArticles.defaultProps = {};

AllArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default AllArticles;
