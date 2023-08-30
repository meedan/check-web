import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import IconEllipse from '../../../icons/ellipse.svg';
import styles from '../SearchResults.module.css';

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
    projectMedia.team.verification_statuses.statuses,
    projectMedia.list_columns_values.status,
  );
  return (
    <TableCell className={styles['search-results-status-cell']}>
      {statusObject ? <><IconEllipse style={{ color: statusObject.style.color }} />{statusObject.label}</> : null}
    </TableCell>
  );
}

StatusCell.propTypes = {
  projectMedia: PropTypes.shape({
    team: PropTypes.shape({
      verification_statuses: PropTypes.shape({
        statuses: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }).isRequired), // undefined during optimistic update
      }).isRequired,
    }),
    list_columns_values: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
