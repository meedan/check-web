import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import TrashIcon from '../../icons/delete.svg';

const TrashedArticles = ({ routeParams }) => (
  <Articles
    defaultFilters={{ trashed: true }}
    filterOptions={['users', 'tags', 'range', 'language_filter']}
    icon={<TrashIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Trash" description="Title of the trashed articles page." id="trashedArticles.title" />}
  />
);

TrashedArticles.defaultProps = {};

TrashedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default TrashedArticles;
