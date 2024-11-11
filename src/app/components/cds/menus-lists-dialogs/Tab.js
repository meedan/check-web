import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './Tab.module.css';

const Tab = ({
  active,
  className,
  disabled,
  extraLabel,
  iconCenter,
  iconLeft,
  iconRight,
  label,
  onClick,
  show,
  size,
  value,
}) => (
  <>
    { show &&
      <div
        className={cx(
          'tab',
          [styles.tab],
          {
            [className]: true,
            [styles.active]: active,
            [styles.disabled]: disabled,
            [styles.sizeDefault]: size === 'default',
            [styles.sizeLarge]: size === 'large',
          })}
        onClick={() => !disabled ? onClick(value) : null}
        onKeyPress={() => !disabled ? onClick(value) : null}
      >
        {iconLeft && <div className={styles['tab-icon-left-icon']}>{iconLeft}</div>}
        {iconCenter && <div className={styles['tab-icon-center-icon']}>{iconCenter}</div>}
        {!iconCenter &&
          <div>
            {label}{extraLabel}
          </div>
        }
        {iconRight && <div className={styles['tab-icon-right-icon']}>{iconRight}</div>}
      </div>
    }
  </>
);

Tab.defaultProps = {
  active: false,
  className: null,
  disabled: false,
  extraLabel: '',
  iconLeft: null,
  iconRight: null,
  iconCenter: null,
  show: true,
  size: 'default',
};

Tab.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  extraLabel: PropTypes.string,
  iconCenter: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  show: PropTypes.bool,
  size: PropTypes.oneOf(['large', 'default']),
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Tab;
