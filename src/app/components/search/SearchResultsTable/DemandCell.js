import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function DemandCell({ projectMedia }) {
  const { demand } = projectMedia.list_columns_values;
  let value = demand;
  if (projectMedia.is_secondary) {
    value = projectMedia.requests_count;
  }
  return <NumberCell value={value} />;
}
DemandCell.propTypes = {
  projectMedia: PropTypes.shape({
    is_secondary: PropTypes.bool.isRequired,
    requests_count: PropTypes.number.isRequired,
    list_columns_values: PropTypes.shape({
      demand: PropTypes.number, // or null/undefined
    }).isRequired,
  }).isRequired,
};
