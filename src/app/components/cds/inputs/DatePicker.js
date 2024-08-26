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
      <div className={cx(
        [inputStyles['label-container']],
        {
          [inputStyles['error-label']]: error,
        })
      }
      >
        { label && <label htmlFor="name">{label}</label> }
      </div>
    )}
    <div className={cx(inputStyles['input-container'], styles['datepicker-container'])}>
      <input
        className={`${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error}`}
        disabled={disabled}
        type="date"
        {...inputProps}
      />
    </div>
    { helpContent && (
      <div className={cx(
        [inputStyles['help-container']],
        {
          [inputStyles['error-label']]: error,
        })
      }
      >
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
  helpContent: PropTypes.node,
  label: PropTypes.node,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default DatePicker;
