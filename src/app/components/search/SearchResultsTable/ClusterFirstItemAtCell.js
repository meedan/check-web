import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function ClusterFirstItemAtCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={projectMedia.cluster.first_item_at} />;
}

ClusterFirstItemAtCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster: PropTypes.shape({
      first_item_at: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
