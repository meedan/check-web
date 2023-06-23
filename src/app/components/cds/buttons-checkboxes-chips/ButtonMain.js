import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import styles from './ButtonMain.module.css';

const ButtonMain = ({
  label,
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
      disableRipple
      {...buttonProps}
    >
      <span className="typography-button">
        {label}
      </span>
    </Button>
  </div>
);

ButtonMain.defaultProps = {
  customStyle: {},
  buttonProps: {},
  onClick: () => {},
};

ButtonMain.propTypes = {
  label: PropTypes.object.isRequired,
  customStyle: PropTypes.object,
  buttonProps: PropTypes.object,
  onClick: PropTypes.func,
};

export default ButtonMain;
