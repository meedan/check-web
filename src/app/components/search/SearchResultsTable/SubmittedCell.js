import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function SubmittedCell({ projectMedia }) {
  const timestamp = projectMedia.list_columns_values.created_at_timestamp;
  return <TimeCell unixTimestampInS={timestamp} />;
}
SubmittedCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      created_at_timestamp: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
