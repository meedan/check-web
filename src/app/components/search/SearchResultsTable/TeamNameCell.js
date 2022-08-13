import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  teamName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default function TeamNameCell({ projectMedia }) {
  const classes = useStyles();
  const teamName = projectMedia.list_columns_values.team_name;

  return (
    <TableCell align="center">
      <div className={classes.teamName} >
        <span >{teamName}</span>
      </div>
    </TableCell>
  );
}

TeamNameCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      team_name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
