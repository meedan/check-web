import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';

function truncate(str, length) {
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
  const [showMore, setShowMore] = React.useState(false);

  function handleUrlChipClick(e) {
    e.stopPropagation();
    setShowMore(true);
  }

  if (value) {
    switch (type) {
    case 'free_text':
      value = typeof value === 'string' ? truncate(value, 32) : value;
      break;
    case 'number':
      value = <span className={classes.number}>{value}</span>;
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
    case 'url':
      urls = JSON.parse(value);
      if (urls.length < 4) {
        value = (
          <ul>
            { urls.map(item => (
              <li key={item.url}>
                <a
                  className={classes.link}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  {truncate(item.title || item.url, 22)}
                </a>
              </li>
            ))}
          </ul>
        );
      } else {
        value = (
          <ul>
            { urls.slice(0, 2).map(item => (
              <li key={item.url}>
                <a
                  className={classes.link}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  {truncate(item.title || item.url, 25)}
                </a>
              </li>
            ))}
            {
              showMore ? urls.slice(2).map(item => (
                <li key={item.url}>
                  <a
                    className={classes.link}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    {truncate(item.title || item.url, 25)}
                  </a>
                </li>
              )) : (
                <Chip
                  className={classes.urlChip}
                  label={`+${urls.length - 2} more`}
                  size="small"
                  onClick={handleUrlChipClick}
                />
              )}
          </ul>
        );
      }
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
