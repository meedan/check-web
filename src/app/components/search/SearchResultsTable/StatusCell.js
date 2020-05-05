import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';

function findStatusObjectOrNull(statuses, statusId) {
  if (!statuses) {
    return null;
  }
  const index = statuses.findIndex(({ id }) => id === statusId);
  if (index === -1) {
    return null;
  }
  return statuses[index];
}

export default function StatusCell({ projectMedia }) {
  const statusObject = findStatusObjectOrNull(
    projectMedia.verification_statuses.statuses,
    projectMedia.status,
  );
  return (
    <TableCell>
      {statusObject ? statusObject.label : null}
    </TableCell>
  );
}
StatusCell.propTypes = {
  projectMedia: PropTypes.shape({
    verification_statuses: PropTypes.shape({
      statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired), // undefined during optimistic update
    }).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};
