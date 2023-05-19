import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
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
      <Typography variant="body2">
        <div className={`${styles['label-container']} ${error && styles['error-label']}`} >
          <div className={styles.label} >
            { label && <label htmlFor="name">{label}</label> }
          </div>
        </div>
      </Typography>
    )}
    <input
      type="date"
      className={`${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error}`}
      {...inputProps}
    />
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
