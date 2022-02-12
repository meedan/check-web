import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import { Link } from 'react-router';
import TableCell from '@material-ui/core/TableCell';

export default function NumberCell({ value, linkTo }) {
  const formattedValue = value === null ? null : <FormattedNumber value={value} />;
  return (
    <TableCell align="center">
      {linkTo ? <Link to={linkTo}>{formattedValue}</Link> : formattedValue}
    </TableCell>
  );
}
NumberCell.defaultProps = {
  value: null,
  linkTo: null,
};
NumberCell.propTypes = {
  value: PropTypes.number, // or null
  linkTo: PropTypes.string, // or null
};
