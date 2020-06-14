import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function LinkedItemsCountCell({ projectMedia }) {
  const { related_count } = projectMedia;
  return <NumberCell value={related_count} />;
}
LinkedItemsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    related_count: PropTypes.number.isRequired,
  }).isRequired,
};
