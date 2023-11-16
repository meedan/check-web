import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Time.module.css';

const Time = ({
  className,
  disabled,
  variant,
  error,
  label,
  helpContent,
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
    <div className={cx(inputStyles['input-container'], styles['time-container'])}>
      <input
        type="time"
        error={error}
        className={`${styles.input} ${error && styles.error} ${variant === 'outlined' && styles.outlined}`}
        disabled={disabled}
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

Time.defaultProps = {
  className: '',
  disabled: false,
  label: null,
};

Time.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.element,
};

export default Time;
