import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  creatorName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});


export default function CreatorNameCell({ projectMedia }) {
  const classes = useStyles();
  const creatorName = projectMedia.list_columns_values.creator_name;

  return (
    <TableCell align="center">
      <div className={classes.creatorName} >
        <span >{creatorName}</span>
      </div>
    </TableCell>
  );
}

CreatorNameCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      creator_name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
