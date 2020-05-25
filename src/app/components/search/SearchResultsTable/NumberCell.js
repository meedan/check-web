import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';

export default function NumberCell({ value }) {
  return (
    <TableCell align="center">
      {value ? <FormattedNumber value={value} /> : null}
    </TableCell>
  );
}
NumberCell.defaultProps = {
  value: null,
};
NumberCell.propTypes = {
  value: PropTypes.number, // or null
};
