import React from 'react';
import PropTypes from 'prop-types';
import ToggleButtonMui from '@material-ui/lab/ToggleButton';
import ToggleButtonGroupMui from '@material-ui/lab/ToggleButtonGroup';
import styles from './ToggleButtonGroup.module.css';

const ToggleButton = ({ children, ...toggleButtonProps }) => (
  <ToggleButtonMui {...toggleButtonProps}>
    {children}
  </ToggleButtonMui>
);

const ToggleButtonGroup = ({
  label,
  helpContent,
  variant,
  className,
  children,
  ...toggleButtonGroupProps
}) => (
  <div className={className}>
    { (label) && (
      <div className={`typography-body2 ${styles.label}`}>
        { label && <label htmlFor="name">{label}</label> }
      </div>
    )}
    <ToggleButtonGroupMui className={`${styles.root} ${variant === 'contained' && styles.contained}`} {...toggleButtonGroupProps} >
      {children}
    </ToggleButtonGroupMui>
    { helpContent && (
      <div className={`typography-caption ${styles['help-container']}`}>
        {helpContent}
      </div>
    )}
  </div>
);

ToggleButtonGroup.defaultProps = {
  className: '',
  helpContent: null,
  label: '',
  variant: 'outlined',
};

ToggleButtonGroup.propTypes = {
  className: PropTypes.string,
  helpContent: PropTypes.element,
  label: PropTypes.string,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export { ToggleButton, ToggleButtonGroup };
