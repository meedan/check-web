import React from 'react';
import PropTypes from 'prop-types';
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
      <div className={`${inputStyles['label-container']} ${error && inputStyles['error-label']}`} >
        { label && <label htmlFor="name">{label}</label> }
        { required && <span className={inputStyles.required}>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
      </div>
    )}
    <div className={`${inputStyles['input-container']} ${styles['textfield-container']} ${textArea && styles['textarea-container']}`}>
      { iconLeft && (
        <div className={inputStyles['input-icon-left-icon']}>
          {iconLeft}
        </div>
      )}
      { textArea ? (
        <textarea
          className={`typography-body1 ${styles.input} ${disabled && styles.disabled} ${error && styles.error} ${variant === 'outlined' && styles.outlined} ${iconLeft && styles['input-icon-left']} ${iconRight && styles['input-icon-right']}`}
          type="text"
          disabled={disabled}
          error={error}
          {...inputProps}
        />
      ) : (
        <input
          className={`typography-body1 ${styles.input} ${disabled && styles.disabled} ${error && styles.error} ${variant === 'outlined' && styles.outlined} ${iconLeft && styles['input-icon-left']} ${iconRight && styles['input-icon-right']}`}
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
      <div className={`${inputStyles['help-container']} ${error && inputStyles['error-label']}`}>
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
