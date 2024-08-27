/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3703-28265&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import ToggleButtonMui from '@material-ui/lab/ToggleButton';
import ToggleButtonGroupMui from '@material-ui/lab/ToggleButtonGroup';
import cx from 'classnames/bind';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './ToggleButtonGroup.module.css';

const ToggleButton = ({ children, ...toggleButtonProps }) => (
  <ToggleButtonMui {...toggleButtonProps}>
    {children}
  </ToggleButtonMui>
);

const ToggleButtonGroup = ({
  children,
  className,
  helpContent,
  label,
  size,
  variant,
  ...toggleButtonGroupProps
}) => (
  <div
    className={cx(
      inputStyles['input-wrapper'],
      {
        [className]: true,
      })
    }
  >
    { (label) && (
      <div className={inputStyles['label-container']}>
        { label && <label htmlFor="name">{label}</label> }
      </div>
    )}
    <div className={inputStyles['input-container']}>
      <div
        className={cx(
          styles['toggle-button-group'],
          {
            [className]: true,
            [styles.sizeDefault]: size === 'default',
            [styles.sizeSmall]: size === 'small',
            [styles.sizeLarge]: size === 'large',
            [styles.contained]: variant === 'contained',
            [styles.outlined]: variant === 'outlined',
          })
        }
      >
        <ToggleButtonGroupMui
          classes={{
            root: styles.root,
          }}
          {...toggleButtonGroupProps}
        >
          {children}
        </ToggleButtonGroupMui>
      </div>
    </div>
    { helpContent && (
      <div className={inputStyles['help-container']}>
        {helpContent}
      </div>
    )}
  </div>
);

ToggleButtonGroup.defaultProps = {
  className: '',
  size: 'default',
  helpContent: null,
  label: '',
  variant: 'outlined',
};

ToggleButtonGroup.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['default', 'small', 'large']),
  helpContent: PropTypes.node,
  label: PropTypes.node,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export { ToggleButton, ToggleButtonGroup };
