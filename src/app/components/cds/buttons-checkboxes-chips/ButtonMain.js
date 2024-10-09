// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=139-6525&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './ButtonMain.module.css';

const ButtonMain = ({
  buttonProps,
  className,
  customStyle,
  disabled,
  iconCenter,
  iconLeft,
  iconRight,
  label,
  onClick,
  onPointerUp,
  size,
  theme,
  title,
  variant,
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
    disabled={disabled}
    style={customStyle}
    title={title}
    type="button"
    variant={variant}
    onClick={onClick}
    onPointerUp={onPointerUp}
    {...buttonProps}
  >
    { iconLeft && (
      <div className={styles['input-icon-left-icon']}>
        {iconLeft}
      </div>
    )}
    <span className={cx('test-label__button', styles.buttonMainLabel)}>
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
  label: null,
  title: null,
  size: 'default',
  theme: 'info',
  variant: 'contained',
  iconLeft: null,
  iconRight: null,
  iconCenter: null,
  disabled: false,
  className: null,
  customStyle: {},
  buttonProps: {},
  onClick: () => {},
  onPointerUp: () => {},
};

ButtonMain.propTypes = {
  buttonProps: PropTypes.object,
  className: PropTypes.string,
  customStyle: PropTypes.object,
  disabled: PropTypes.bool,
  iconCenter: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  size: PropTypes.oneOf(['default', 'small', 'large']),
  theme: PropTypes.oneOf(['info', 'lightInfo', 'text', 'lightText', 'error', 'lightError', 'validation', 'lightValidation', 'alert', 'lightAlert', 'black', 'white', 'beige', 'lightBeige']),
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  onClick: PropTypes.func,
  onPointerUp: PropTypes.func,
};

export default ButtonMain;
