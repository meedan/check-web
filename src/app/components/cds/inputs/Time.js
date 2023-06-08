import React from 'react';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Time.module.css';

const Time = ({
  variant,
  ...inputProps
}) => (
  <div className={`${inputStyles['input-container']} ${styles['time-container']}`}>
    <input
      type="time"
      className={`${styles.input} ${variant === 'outlined' && styles.outlined}`}
      {...inputProps}
    />
  </div>
);

export default Time;
