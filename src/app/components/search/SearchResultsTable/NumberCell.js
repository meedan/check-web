import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import { opaqueBlack10 } from '../../../styles/js/shared';

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    maxWidth: '40px',
    minHeight: '40px',
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: opaqueBlack10,
    },
  },
});

const swallowClick = (ev) => {
  // prevent <TableRow onClick> from firing when we click the link
  ev.stopPropagation();
};

export default function NumberCell({ value, linkTo }) {
  const classes = useStyles();
  const formattedValue = value === null ? null : <FormattedNumber value={value} />;
  return (
    <TableCell align="center">
      {linkTo ?
        <Link onClick={swallowClick} to={linkTo}>
          <div className={classes.link}>
            {formattedValue}
          </div>
        </Link> : formattedValue}
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
