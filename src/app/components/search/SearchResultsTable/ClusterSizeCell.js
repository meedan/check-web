import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ClusterSizeCell({ projectMedia }) {
  const clusterSize = projectMedia.cluster_size;
  return <NumberCell value={clusterSize} />;
}

ClusterSizeCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster_size: PropTypes.number.isRequired,
  }).isRequired,
};
