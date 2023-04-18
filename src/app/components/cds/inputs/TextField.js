import React from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '@material-ui/icons/Error';
import { FormattedMessage } from 'react-intl';
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
      <div className={`typography-body2 ${styles['label-container']} ${error && styles['error-label']}`} >
        <div className={styles.label} >
          { label && <label htmlFor="name">{label}</label> }
        </div>
        <div className={styles.required} >
          { required && <span>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
        </div>
      </div>
    )}
    <div className={styles['input-container']}>
      { iconLeft && (
        <div className={styles['input-icon-left-icon']}>
          {iconLeft}
        </div>
      )}
      { textArea ? (
        <textarea
          className={`typography-body1 ${styles.input} ${disabled && styles.disabled} ${error && styles.error} ${variant === 'outlined' && styles.outlined} ${iconLeft && styles['input-icon-left']} ${iconLeft && styles['input-icon-left']} ${iconRight && styles['input-icon-right']}`}
          type="text"
          disabled={disabled}
          error={error}
          {...inputProps}
        />
      ) : (
        <input
          className={`typography-body1 ${styles.input} ${disabled && styles.disabled} ${error && styles.error} ${variant === 'outlined' && styles.outlined} ${iconLeft && styles['input-icon-left']} ${iconLeft && styles['input-icon-left']} ${iconRight && styles['input-icon-right']}`}
          type="text"
          disabled={disabled}
          error={error}
          {...inputProps}
        />
      )}
      { iconRight && (
        <div className={styles['input-icon-right-icon']}>
          {iconRight}
        </div>
      )}
    </div>
    { helpContent && (
      <div className={`typography-caption ${styles['help-container']} ${error && styles['error-label']}`}>
        { error && <ErrorIcon className={styles['error-icon']} />}
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
