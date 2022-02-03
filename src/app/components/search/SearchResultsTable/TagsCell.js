import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  tag: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

function formatTags(value) {
  const tags = value.split(', ');
  const newValue = tags.slice(0, 3);
  if (tags.length > 3) {
    newValue[2] = `${newValue[2]} + ${tags.length - 3}`;
  }
  return newValue;
}

export default function TagsCell({ projectMedia }) {
  const classes = useStyles();
  const tags = projectMedia.list_columns_values.tags_as_sentence;

  if (tags === '' || tags === null) {
    return <TableCell>-</TableCell>;
  }

  return (
    <TableCell>
      {formatTags(tags).map(tag => (
        <div className={classes.tag}>{tag}</div>
      ))}
    </TableCell>
  );
}

TagsCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      tags_as_sentence: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
