import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function DemandCell({ projectMedia }) {
  const { demand } = projectMedia;
  return <NumberCell value={demand} />;
}
DemandCell.propTypes = {
  projectMedia: PropTypes.shape({
    demand: PropTypes.number, // or null/undefined
  }).isRequired,
};
