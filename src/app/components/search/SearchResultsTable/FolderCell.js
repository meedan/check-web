import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

function truncate(str) {
  const length = 32;
  const dots = str.length > length ? '...' : '';
  return `${str.substring(0, length)}${dots}`;
}

export default function FolderCell({ projectMedia }) {
  const classes = useStyles();
  const title = projectMedia.list_columns_values.folder;

  if (!title) {
    return <TableCell>-</TableCell>;
  }

  return (
    <TableCell>
      <div className={classes.title} title={title}>
        {typeof title === 'string' ? truncate(title) : title}
      </div>
    </TableCell>
  );
}

FolderCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      folder: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
