import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import TrashIcon from '../../icons/delete.svg';

const TrashedArticles = ({ routeParams }) => {
  const [type, setType] = React.useState('fact-check');

  const handleChangeArticleType = (newType) => {
    if (newType === 'explainer') {
      setType(newType);
    } else if (newType === 'fact-check') {
      setType('fact-check');
    } else {
      setType(null);
    }
  };

  return (
    <Articles
      articleTypeReadOnly={false}
      defaultFilters={{ trashed: true }}
      filterOptions={['users', 'tags', 'range']}
      icon={<TrashIcon />}
      teamSlug={routeParams.team}
      title={<FormattedMessage defaultMessage="Trash" description="Title of the trashed articles page." id="trashedArticles.title" />}
      type={type}
      onChangeArticleType={handleChangeArticleType}
    />
  );
};

TrashedArticles.defaultProps = {};

TrashedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default TrashedArticles;
