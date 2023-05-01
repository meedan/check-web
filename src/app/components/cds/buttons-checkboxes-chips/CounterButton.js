import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles({
  counterButton: {
    display: 'block',
    padding: '0 8px',
    '&:hover': {
      color: 'var(--brandSecondary)',
      backgroundColor: 'inherit',
    },
    '&:active': {
      color: 'var(--brandMain)',
    },
  },
  zeroCount: {
    color: 'var(--textPrimary)',
  },
  moreThanZeroCount: {
    color: 'var(--brandMain)',
  },
  noClick: {
    cursor: 'default',
    '&:hover': {
      color: 'var(--brandMain)',
    },
    '&:active': {
      color: 'var(--brandMain)',
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
