import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function LinkedItemsCountCell({ projectMedia }) {
  const linkedItemsCount = projectMedia.list_columns_values.linked_items_count;
  const linkedItemsUrl = `/${projectMedia.team.slug}/media/${projectMedia.dbid}/similar-media`;
  return <NumberCell value={linkedItemsCount} linkTo={linkedItemsCount ? linkedItemsUrl : null} />;
}

LinkedItemsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    list_columns_values: PropTypes.shape({
      linked_items_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
