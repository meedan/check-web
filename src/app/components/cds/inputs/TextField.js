// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=623-12029&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import ErrorIcon from '../../../icons/error.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './TextField.module.css';

// A hook that is like useEffect but does not trigger on first input
// https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render
function useEffectSkipFirst(fn, inputs) {
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    if (didMountRef.current) {
      return fn();
    }
    didMountRef.current = true;
    return null;
  }, inputs);
}

const TextField = React.forwardRef(({
  className,
  disabled,
  error,
  suppressInitialError,
  helpContent,
  iconLeft,
  iconRight,
  label,
  placeholder,
  required,
  variant,
  textArea,
  autoGrow,
  componentProps,
  ...inputProps
}, ref) => {
  const [internalError, setInternalError] = React.useState(suppressInitialError ? false : error);

  useEffectSkipFirst(() => {
    setInternalError(error);
  });

  return (
    <div className={className}>
      { (label || required) && (
        <div className={cx(
          [inputStyles['label-container']],
          {
            [inputStyles['error-label']]: internalError,
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
          [styles['textarea-autoGrow']]: autoGrow,
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
                [styles.error]: internalError,
                [styles.outlined]: variant === 'outlined',
                [styles['input-icon-left']]: iconLeft,
                [styles['input-icon-right']]: iconRight,
              })
            }
            ref={ref}
            disabled={disabled}
            error={internalError}
            placeholder={placeholder}
            {...componentProps}
            {...inputProps}
          />
        ) : (
          <input
            className={cx(
              'typography-body1',
              [styles.input],
              {
                [styles.disabled]: disabled,
                [styles.error]: internalError,
                [styles.outlined]: variant === 'outlined',
                [styles['input-icon-left']]: iconLeft,
                [styles['input-icon-right']]: iconRight,
              })
            }
            ref={ref}
            type="text"
            disabled={disabled}
            error={internalError}
            placeholder={placeholder}
            {...componentProps}
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
            [inputStyles['error-label']]: internalError,
          })
        }
        >
          { internalError && <ErrorIcon className={inputStyles['error-icon']} />}
          {helpContent}
        </div>
      )}
    </div>
  );
});

TextField.defaultProps = {
  className: '',
  disabled: false,
  error: false,
  helpContent: null,
  iconLeft: null,
  iconRight: null,
  label: null,
  placeholder: null,
  required: false,
  suppressInitialError: false,
  textArea: false,
  autoGrow: true,
  variant: 'contained',
  componentProps: {},
};

TextField.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  placeholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  required: PropTypes.bool,
  suppressInitialError: PropTypes.bool,
  textArea: PropTypes.bool,
  autoGrow: PropTypes.bool,
  componentProps: PropTypes.object,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default TextField;
