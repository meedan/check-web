import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import BookIcon from '../../icons/book.svg';
import CheckArticleTypes from '../../constants/CheckArticleTypes';

const Explainers = ({ routeParams }) => (
  <Articles
    defaultFilters={{ article_type: CheckArticleTypes.EXPLAINER }}
    filterOptions={['users', 'tags', 'range', 'language_filter', 'channels']}
    icon={<BookIcon />}
    pageName="explainers"
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Explainers" description="Title of the explainers page." id="explainers.title" />}
  />
);

Explainers.defaultProps = {};

Explainers.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default Explainers;
