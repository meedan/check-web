import React from 'react';
import { FormattedNumber } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';

export default function NumberCell({ value }) {
  return (
    <TableCell align="center">
      <FormattedNumber value={value} />
    </TableCell>
  );
}
