import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles(theme => ({
  root: {
    whiteSpace: 'nowrap',
    maxWidth: theme.spacing(28),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export default function StatusCell({ projectMedia }) {
  const classes = useStyles();
  const statusObject = findStatusObjectOrNull(
    projectMedia.team.verification_statuses.statuses,
    projectMedia.list_columns_values.status,
  );
  return (
    <TableCell classes={classes}>
      {statusObject ? statusObject.label : null}
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
