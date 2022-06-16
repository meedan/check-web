import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function ClusterLastItemAtCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={projectMedia.cluster.last_item_at} />;
}

ClusterLastItemAtCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      last_item_at: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
