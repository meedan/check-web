import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TimeCell from './TimeCell';

export default function FactCheckPublishedAtCell({ projectMedia }) {
  const timestamp = projectMedia.list_columns_values.fact_check_published_on;
  if (timestamp === 0) {
    return <TableCell>-</TableCell>;
  }
  return <TimeCell unixTimestampInS={timestamp} />;
}

FactCheckPublishedAtCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      fact_check_published_on: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
