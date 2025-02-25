import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import DescriptionIcon from '../../icons/description.svg';

const AllArticles = ({ routeParams }) => (
  <Articles
    filterOptions={['users', 'tags', 'range', 'language_filter']}
    icon={<DescriptionIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="All Articles" description="Title of the all articles page." id="allArticles.title" />}
  />
);

AllArticles.defaultProps = {};

AllArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default AllArticles;
