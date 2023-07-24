// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=139-6525&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './ButtonMain.module.css';

// FIXME: Refactor using native button instead of MUI Button
const ButtonMain = ({
  id,
  className,
  buttonProps,
  customStyle,
  disabled,
  iconCenter,
  iconLeft,
  iconRight,
  label,
  onClick,
  size,
  theme,
  variant,
  title,
}) => (
  <button
    className={cx(
      [styles.buttonMain],
      styles[`theme-${theme}`],
      {
        [className]: true,
        [styles.sizeDefault]: size === 'default',
        [styles.sizeSmall]: size === 'small',
        [styles.sizeLarge]: size === 'large',
        [styles.contained]: variant === 'contained',
        [styles.outlined]: variant === 'outlined',
        [styles.textVariant]: variant === 'text',
        [styles['input-icon-center']]: iconCenter,
      })
    }
    classes={{
      root: styles.root,
    }}
    style={customStyle}
    onClick={onClick}
    disabled={disabled}
    variant={variant}
    id={id}
    title={title}
    type="button"
    {...buttonProps}
  >
    { iconLeft && (
      <div className={styles['input-icon-left-icon']}>
        {iconLeft}
      </div>
    )}
    <span className={`test-label__button ${styles.buttonMainLabel}`}>
      {label}
    </span>
    { iconCenter && (
      <div className={styles['input-icon-center-icon']}>
        {iconCenter}
      </div>
    )}
    { iconRight && (
      <div className={styles['input-icon-right-icon']}>
        {iconRight}
      </div>
    )}
  </button>
);

ButtonMain.defaultProps = {
  id: null,
  label: null,
  title: null,
  size: 'default',
  theme: 'brand',
  variant: 'contained',
  iconLeft: null,
  iconRight: null,
  iconCenter: null,
  disabled: false,
  className: null,
  customStyle: {},
  buttonProps: {},
  onClick: () => {},
};

ButtonMain.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.object,
  size: PropTypes.oneOf(['default', 'small', 'large']),
  theme: PropTypes.oneOf(['brand', 'lightBrand', 'text', 'lightText', 'error', 'lightError', 'validation', 'lightValidation', 'alert', 'lightAlert']),
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  iconCenter: PropTypes.element,
  title: PropTypes.object,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  disabled: PropTypes.bool,
  customStyle: PropTypes.object,
  buttonProps: PropTypes.object,
  onClick: PropTypes.func,
};

export default ButtonMain;
