import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TimeCell from './TimeCell';

export default function MediaPublishedCell({ projectMedia }) {
  const timestamp = projectMedia.list_columns_values.media_published_at;
  if (timestamp === 0) {
    return <TableCell>-</TableCell>;
  }
  return <TimeCell unixTimestampInS={timestamp} />;
}

MediaPublishedCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      media_published_at: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
