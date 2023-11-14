import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './DatePicker.module.css';

const DatePicker = ({
  className,
  disabled,
  error,
  helpContent,
  label,
  variant,
  ...inputProps
}) => (
  <div
    className={cx(
      inputStyles['input-wrapper'],
      {
        [className]: true,
        [inputStyles.disabled]: disabled,
      })
    }
  >
    { label && (
      <div className={`${inputStyles['label-container']} ${error && inputStyles['error-label']}`}>
        { label && <label htmlFor="name">{label}</label> }
      </div>
    )}
    <div className={cx(inputStyles['input-container'], styles['datepicker-container'])}>
      <input
        type="date"
        className={`${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error}`}
        disabled={disabled}
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
  disabled: false,
  error: false,
  helpContent: null,
  label: null,
  variant: 'contained',
};

DatePicker.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  label: PropTypes.element,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default DatePicker;
