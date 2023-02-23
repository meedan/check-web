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
} from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  mainButton: {
    padding: `${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`,
    marginRight: theme.spacing(2),
    borderRadius: theme.spacing(1),
    '&:hover': {
      color: brandSecondary,
      backgroundColor: 'inherit',
    },
    '&:active': {
      color: brandMain,
    },
  },
}));

const MainButton = ({ variant, label, onClick }) => {
  const classes = useStyles();
  return (
    <Button
      onClick={onClick}
      className={`main-button ${classes.mainButton}`}
      variant={variant}
      disableRipple
    >
      <Typography
        variant="button"
      >
        {label}
      </Typography>
      <br />
    </Button>
  );
};

MainButton.defaultProps = {
  onClick: () => {},
  variant: 'text',
};

MainButton.propTypes = {
  label: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.string,
};

export default MainButton;

