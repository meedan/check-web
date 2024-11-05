import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './Tab.module.css';

const Tab = ({
  active,
  disabled,
  iconCenter,
  iconLeft,
  iconRight,
  isOverflowing,
  label,
  size,
}) => (
  <>
    <div className={cx(
      'tab',
      [styles.tab],
      {
        [styles.active]: active,
        [styles.disabled]: disabled,
        [styles.sizeDefault]: size === 'default',
        [styles.sizeLarge]: size === 'large',
      })}
    >
      {iconLeft && <span>{iconLeft}</span>}
      {iconCenter && <span>{iconCenter}</span>}
      {iconRight && <span>{iconRight}</span>}
      {!iconCenter && label}
      { isOverflowing && <div className={styles.tabOverflow}>Overflowing</div> }
    </div>
  </>
);

Tab.defaultProps = {
  active: false,
  disabled: false,
  iconLeft: null,
  iconRight: null,
  iconCenter: null,
  isOverflowing: false,
  size: 'default',
};

Tab.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  iconCenter: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  isOverflowing: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  size: PropTypes.oneOf(['large', 'default']),
};

export default Tab;
