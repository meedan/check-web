import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';

export default function NumberCell({ value }) {
  return (
    <TableCell align="center">
      {value === null ? null : <FormattedNumber value={value} />}
    </TableCell>
  );
}
NumberCell.defaultProps = {
  value: null,
};
NumberCell.propTypes = {
  value: PropTypes.number, // or null
};
