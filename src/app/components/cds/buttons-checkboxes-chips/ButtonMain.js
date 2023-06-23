import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import styles from './ButtonMain.module.css';

const ButtonMain = ({
  label,
  variant,
  customStyle,
  buttonProps,
  onClick,
}) => (
  <div className={styles.buttonMain}>
    <Button
      classes={{
        root: styles.root,
      }}
      style={customStyle}
      onClick={onClick}
      size="small"
      variant={variant}
      disableRipple
      disableFocusRipple
      disableElevation
      {...buttonProps}
    >
      <span className={`typography-button ${styles.buttonMainLabel}`}>
        {label}
      </span>
    </Button>
  </div>
);

ButtonMain.defaultProps = {
  variant: 'contained',
  customStyle: {},
  buttonProps: {},
  onClick: () => {},
};

ButtonMain.propTypes = {
  label: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined']),
  customStyle: PropTypes.object,
  buttonProps: PropTypes.object,
  onClick: PropTypes.func,
};

export default ButtonMain;
