import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

function truncate(str) {
  const length = 32;
  const dots = str.length > length ? '...' : '';
  return `${str.substring(0, length)}${dots}`;
}

function formatMultipleChoice(value) {
  const choices = value.split(', ');
  const newValue = choices.slice(0, 3);
  if (choices.length > 3) {
    newValue[2] = `${newValue[2]} + ${choices.length - 3}`;
  }
  return newValue;
}

const useStyles = makeStyles({
  multiChoice: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default function MetadataCell({ projectMedia, field, type }) {
  const classes = useStyles();
  let value = projectMedia.list_columns_values[field];

  if (value) {
    switch (type) {
    case 'free_text':
      value = typeof value === 'string' ? truncate(value) : value;
      break;
    case 'file_upload':
      value = <b>{value}</b>;
      break;
    case 'multiple_choice':
      value = formatMultipleChoice(value).map(v => <div className={classes.multiChoice}>{v}</div>);
      break;
    case 'datetime':
      value = value.replace('at 00:00 notime', '').replace(/\(.*\)/, '');
      break;
    default:
      break;
    }
  }

  return (
    <TableCell align="left">
      {value || '-'}
    </TableCell>
  );
}

MetadataCell.propTypes = {
  field: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.object.isRequired,
  }).isRequired,
};
