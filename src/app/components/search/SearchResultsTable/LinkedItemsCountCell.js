import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function LinkedItemsCountCell({ projectMedia }) {
  const linkedItemsCount = projectMedia.linked_items_count;
  return <NumberCell value={linkedItemsCount} />;
}
LinkedItemsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    linked_items_count: PropTypes.number.isRequired,
  }).isRequired,
};
