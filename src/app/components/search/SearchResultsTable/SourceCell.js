import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  source: {
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

export default function SourceCell({ projectMedia }) {
  const classes = useStyles();
  let source = '';
  if (projectMedia.source) {
    source = projectMedia.source.name;
  }

  if (!source) {
    return <TableCell>-</TableCell>;
  }

  return (
    <TableCell>
      <div className={classes.source} title={source}>
        {truncate(source)}
      </div>
    </TableCell>
  );
}

SourceCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      source: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
