import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Typography,
} from '@material-ui/core';
import {
  brandSecondary,
  brandMain,
  textPrimary,
} from '../../../styles/js/shared';

const useStyles = makeStyles({
  counterButton: {
    display: 'block',
    padding: '0 8px',
    '&:hover': {
      color: brandSecondary,
      backgroundColor: 'inherit',
    },
    '&:active': {
      color: brandMain,
    },
  },
  zeroCount: {
    color: textPrimary,
  },
  moreThanZeroCount: {
    color: brandMain,
  },
  noClick: {
    cursor: 'default',
    '&:hover': {
      color: brandMain,
    },
    '&:active': {
      color: brandMain,
    },
  },
});

const CounterButton = ({
  label, count, onClick,
}) => {
  const classes = useStyles();
  return (
    <Button
      onClick={onClick}
      className={`counter-button ${classes.counterButton} ${count === 0 ? classes.zeroCount : classes.moreThanZeroCount} ${onClick ? '' : classes.noClick}`}
      disableRipple
    >
      <Typography
        variant="overline"
      >
        {label}
      </Typography>
      <br />
      <Typography variant="subtitle2">
        {count}
      </Typography>
    </Button>
  );
};

CounterButton.defaultProps = {
  onClick: () => {},
};

CounterButton.propTypes = {
  label: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default CounterButton;
