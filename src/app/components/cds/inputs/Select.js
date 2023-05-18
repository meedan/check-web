import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import styles from './Select.module.css';

const Select = ({
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
  children,
  ...inputProps
}) => (
  <div className={className}>
    { (label || required) && (
      <Typography variant="body2">
        <div className={`${styles['label-container']} ${error && styles['error-label']}`} >
          <div className={styles.label} >
            { label && <label htmlFor="name">{label}</label> }
          </div>
          <div className={styles.required} >
            { required && <span>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
          </div>
        </div>
      </Typography>
    )}
    <div className={styles['input-container']}>
      { iconLeft && (
        <div className={styles['input-icon-left-icon']}>
          {iconLeft}
        </div>
      )}
      <Typography variant="body1">
        <select
          className={`${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error}`}
          disabled={disabled}
          {...inputProps}
        >
          {children}
        </select>
      </Typography>
      { iconRight && (
        <div className={styles['input-icon-right-icon']}>
          {iconRight}
        </div>
      )}
    </div>
    { helpContent && (
      <Typography variant="caption">
        <div className={`${styles['help-container']} ${error && styles['error-label']}`}>
          { error && <ErrorOutlineIcon className={styles['error-icon']} />}
          {helpContent}
        </div>
      </Typography>
    )}
  </div>
);

Select.defaultProps = {
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

Select.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.string,
  required: PropTypes.bool,
  textArea: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default Select;

