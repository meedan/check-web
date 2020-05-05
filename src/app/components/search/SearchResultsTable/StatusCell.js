import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';

function findStatusObject(statuses, statusId) {
  const index = statuses.findIndex(({ id }) => id === statusId);
  if (index === -1) {
    throw new Error(`Invalid status ID ${statusId}`);
  }
  return statuses[index];
}

export default function StatusCell({ projectMedia }) {
  const statusObject = findStatusObject(
    projectMedia.verification_statuses.statuses,
    projectMedia.status,
  );
  return (
    <TableCell>
      {statusObject.label}
    </TableCell>
  );
}
StatusCell.propTypes = {
  projectMedia: PropTypes.shape({
    verification_statuses: PropTypes.shape({
      statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })).isRequired,
    }).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};
