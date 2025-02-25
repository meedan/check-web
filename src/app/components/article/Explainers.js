import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import BookIcon from '../../icons/book.svg';

const Explainers = ({ routeParams }) => (
  <Articles
    filterOptions={['users', 'tags', 'range', 'language_filter']}
    icon={<BookIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Explainers" description="Title of the explainers page." id="explainers.title" />}
    type="explainer"
  />
);

Explainers.defaultProps = {};

Explainers.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default Explainers;
