import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';

export default function TimeCell({ unixTimestampInS }) {
  const date = new Date(unixTimestampInS * 1000);

  return (
    <TableCell align="center">
      <time dateTime={date.toISOString()}>
        <FormattedRelative value={date} />
      </time>
    </TableCell>
  );
}
TimeCell.propTypes = {
  unixTimestampInS: PropTypes.number.isRequired,
};
