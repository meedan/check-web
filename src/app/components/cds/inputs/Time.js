import React from 'react';
import PropTypes from 'prop-types';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Time.module.css';

const Time = ({
  className,
  variant,
  ...inputProps
}) => (
  <div className={className}>
    <div className={`${inputStyles['input-container']} ${styles['time-container']}`}>
      <input
        type="time"
        className={`${styles.input} ${variant === 'outlined' && styles.outlined}`}
        {...inputProps}
      />
    </div>
  </div>
);

Time.defaultProps = {
  className: '',
};

Time.propTypes = {
  className: PropTypes.string,
};

export default Time;
