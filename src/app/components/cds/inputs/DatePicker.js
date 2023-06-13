import React from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './DatePicker.module.css';

const DatePicker = ({
  className,
  error,
  helpContent,
  label,
  variant,
  ...inputProps
}) => (
  <div className={className}>
    { label && (
      <div className={`${inputStyles['label-container']} ${error && inputStyles['error-label']}`}>
        { label && <label htmlFor="name">{label}</label> }
      </div>
    )}
    <div className={`${inputStyles['input-container']} ${styles['datepicker-container']}`}>
      <input
        type="date"
        className={`${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error}`}
        {...inputProps}
      />
    </div>
    { helpContent && (
      <div className={`${inputStyles['help-container']} ${error && inputStyles['error-label']}`}>
        { error && <ErrorIcon className={inputStyles['error-icon']} />}
        {helpContent}
      </div>
    )}
  </div>
);

DatePicker.defaultProps = {
  className: '',
  error: false,
  helpContent: null,
  label: '',
  variant: 'contained',
};

DatePicker.propTypes = {
  className: PropTypes.string,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  label: PropTypes.string,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default DatePicker;
