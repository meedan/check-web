import React from 'react';
import styles from './Time.module.css';

const Time = ({
  variant,
  ...inputProps
}) => (
  <input
    type="time"
    className={`${styles.input} ${variant === 'outlined' && styles.outlined}`}
    {...inputProps}
  />
);

export default Time;
