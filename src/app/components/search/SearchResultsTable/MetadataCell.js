import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import ValueListCell from './ValueListCell';
import { truncateLength } from '../../../helpers';

const useStyles = makeStyles({
  number: {
    textAlign: 'right',
  },
  urlChip: {
    backgroundColor: '#979797',
    color: 'white',
    marginTop: '4px',
  },
  link: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
});

export default function MetadataCell({ projectMedia, field, type }) {
  const classes = useStyles();
  let value = projectMedia.list_columns_values[field];
  let urls;

  if (value) {
    switch (type) {
    case 'free_text':
      value = typeof value === 'string' ? truncateLength(value, 32) : value;
      break;
    case 'number':
      value = <span className={classes.number}>{value}</span>;
      break;
    case 'file_upload':
      value = <b>{value}</b>;
      break;
    case 'multiple_choice':
      value = value.split(',');
      break;
    case 'datetime':
      value = value.replace('at 00:00 notime', '').replace(/\(.*\)/, '');
      break;
    case 'url':
      urls = JSON.parse(value).map(item => (
        <a
          className={classes.link}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
        >
          {truncateLength(item.title || item.url, 22)}
        </a>
      ));
      break;
    default:
      break;
    }
  }

  if (type === 'url' || type === 'multiple_choice') {
    return (
      <ValueListCell
        values={urls || value}
        noValueLabel="-"
      />
    );
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
