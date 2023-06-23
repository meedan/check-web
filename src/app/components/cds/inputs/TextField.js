import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './TextField.module.css';

const TextField = ({
  className,
  disabled,
  error,
  helpContent,
  iconLeft,
  iconRight,
  label,
  required,
  variant,
  textArea,
  ...inputProps
}) => (
  <div className={className}>
    { (label || required) && (
      <div className={cx(
        [inputStyles['label-container']],
        {
          [inputStyles['error-label']]: error,
        })
      }
      >
        { label && <label htmlFor="name">{label}</label> }
        { required && <span className={inputStyles.required}>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
      </div>
    )}
    <div className={cx(
      styles['textfield-container'],
      inputStyles['input-container'],
      {
        [styles['textarea-container']]: textArea,
      })
    }
    >
      { iconLeft && (
        <div className={inputStyles['input-icon-left-icon']}>
          {iconLeft}
        </div>
      )}
      { textArea ? (
        <textarea
          className={cx(
            'typography-body1',
            [styles.input],
            {
              [styles.disabled]: disabled,
              [styles.error]: error,
              [styles.outlined]: variant === 'outlined',
              [styles['input-icon-left']]: iconLeft,
              [styles['input-icon-right']]: iconRight,
            })
          }
          type="text"
          disabled={disabled}
          error={error}
          {...inputProps}
        />
      ) : (
        <input
          className={cx(
            'typography-body1',
            [styles.input],
            {
              [styles.disabled]: disabled,
              [styles.error]: error,
              [styles.outlined]: variant === 'outlined',
              [styles['input-icon-left']]: iconLeft,
              [styles['input-icon-right']]: iconRight,
            })
          }
          type="text"
          disabled={disabled}
          error={error}
          {...inputProps}
        />
      )}
      { iconRight && (
        <div className={inputStyles['input-icon-right-icon']}>
          {iconRight}
        </div>
      )}
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

TextField.defaultProps = {
  className: '',
  disabled: false,
  error: false,
  helpContent: null,
  iconLeft: null,
  iconRight: null,
  label: '',
  required: false,
  textArea: false,
  variant: 'contained',
};

TextField.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.string,
  required: PropTypes.bool,
  textArea: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default TextField;
