import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function DemandCell({ projectMedia }) {
  const { demand } = projectMedia.list_columns_values;
  return <NumberCell value={demand} />;
}
DemandCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      demand: PropTypes.number, // or null/undefined
    }).isRequired,
  }).isRequired,
};
