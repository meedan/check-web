import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ShareCountCell({ projectMedia }) {
  const shareCount = projectMedia.list_columns_values.share_count;
  return <NumberCell value={shareCount} />;
}
ShareCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      share_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
