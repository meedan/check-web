import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ClusterRequestsCell({ projectMedia }) {
  const { requests_count } = projectMedia.cluster;
  return <NumberCell value={requests_count} />;
}

ClusterRequestsCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      requests_count: PropTypes.number, // or null/undefined
    }).isRequired,
  }).isRequired,
};
