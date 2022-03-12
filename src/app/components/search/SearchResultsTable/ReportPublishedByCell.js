import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';

export default function ReportPublishedByCell({ projectMedia }) {
  console.log('published_by', projectMedia); // eslint-disable-line no-console
  const names = Object.values(projectMedia.list_columns_values.published_by);
  return (
    <TableCell>
      { names.length === 0 ? '-' : names[0] }
    </TableCell>
  );
}

ReportPublishedByCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      published_by: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};
