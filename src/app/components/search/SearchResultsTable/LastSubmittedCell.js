import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function LastSubmittedCell({ projectMedia }) {
  return <TimeCell unixTimestampInS={projectMedia.list_columns_values.last_seen} />;
}
LastSubmittedCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      last_seen: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
