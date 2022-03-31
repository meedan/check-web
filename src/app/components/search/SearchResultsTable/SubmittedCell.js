import React from 'react';
import PropTypes from 'prop-types';
import TimeCell from './TimeCell';

export default function SubmittedCell({ projectMedia }) {
  // return the greater (more recent) of `last_seen` or `created_at_timestamp`. if `last_seen` is undefined/null, use `created_at_timestamp`
  return <TimeCell unixTimestampInS={Math.max(projectMedia.list_columns_values.last_seen, projectMedia.list_columns_values.created_at_timestamp) || projectMedia.list_columns_values.created_at_timestamp} />;
}
SubmittedCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      created_at_timestamp: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
