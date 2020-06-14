import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function DemandCell({ projectMedia }) {
  const { requests_related_count } = projectMedia;
  return <NumberCell value={requests_related_count} />;
}
DemandCell.propTypes = {
  projectMedia: PropTypes.shape({
    requests_related_count: PropTypes.number, // or null/undefined
  }).isRequired,
};
