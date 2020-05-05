import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    whiteSpace: 'nowrap',
  },
});

export default function TimeCell({ unixTimestampInS }) {
  const classes = useStyles();
  const date = new Date(unixTimestampInS * 1000);

  return (
    <TableCell align="center" classes={classes}>
      <time dateTime={date.toISOString()}>
        <FormattedRelative value={date} />
      </time>
    </TableCell>
  );
}
TimeCell.propTypes = {
  unixTimestampInS: PropTypes.number.isRequired,
};
