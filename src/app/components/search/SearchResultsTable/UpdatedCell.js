import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function UpdatedCell({ projectMedia }) {
  const timestamp = projectMedia.list_columns_values.updated_at_timestamp;
  return <TimeCell unixTimestampInS={timestamp} />;
}
UpdatedCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      updated_at_timestamp: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
