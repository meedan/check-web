import React from 'react';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Time.module.css';

const Time = ({
  variant,
  error,
  helpContent,
  ...inputProps
}) => (
  <div className={`${inputStyles['input-container']} ${styles['time-container']}`}>
    <input
      type="time"
      error={error}
      className={`${styles.input} ${error && styles.error} ${variant === 'outlined' && styles.outlined}`}
      {...inputProps}
    />
    { helpContent && (
      <div className={`${inputStyles['help-container']} ${error && inputStyles['error-label']}`}>
        { error && <ErrorIcon className={inputStyles['error-icon']} />}
        {helpContent}
      </div>
    )}
  </div>
);

export default Time;
