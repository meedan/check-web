import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function ClusterSizeCell({ projectMedia }) {
  const clusterSize = projectMedia.cluster?.size;
  return <NumberCell value={clusterSize} />;
}

ClusterSizeCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      size: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
