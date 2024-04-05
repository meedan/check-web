// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=623-12029&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ClearIcon from '../../../icons/clear.svg';
import Tooltip from '../alerts-and-prompts/Tooltip';
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
  size,
  textArea,
  autoGrow,
  maxHeight,
  componentProps,
  onRemove,
  ...inputProps
}, ref) => {
  const [internalError, setInternalError] = React.useState(suppressInitialError ? false : error);

  React.useEffect(() => {
    if (ref?.current && textArea) {
      ref.current.parentNode.setAttribute('data-replicated-value', ref.current.value);
    }
  }, []);

  useEffectSkipFirst(() => {
    setInternalError(error);
  });

  return (
    <div
      className={cx(
        inputStyles['input-wrapper'],
        {
          [className]: true,
          [inputStyles.disabled]: disabled,
        })
      }
    >
      { (label || required) && (
        <div className={cx(
          [inputStyles['label-container']],
          {
            [inputStyles['error-label']]: internalError,
            [styles['textfield-removeable']]: onRemove,
            [inputStyles['label-container-label']]: label,
            [inputStyles['label-container-required']]: required,
          })
        }
        >
          { label && <label htmlFor="name">{label}</label> }
          { required && <span className={inputStyles.required}>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
        </div>
      )}
      <div className={styles['textfield-wrapper']}>
        <div
          className={cx(
            styles['textfield-container'],
            inputStyles['input-container'],
            {
              [styles.disabled]: disabled,
              [styles['textarea-container']]: textArea,
              [styles['textarea-autoGrow']]: autoGrow && textArea,
              [styles['textarea-maxHeight']]: maxHeight,
            })
          }
          style={{
            maxHeight,
          }}
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
                  [styles.error]: internalError,
                  [styles.outlined]: variant === 'outlined',
                  [styles.small]: size === 'small',
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
                  [styles.error]: internalError,
                  [styles.outlined]: variant === 'outlined',
                  [styles.small]: size === 'small',
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
        { onRemove ?
          <Tooltip arrow title={<FormattedMessage id="textfield.removeSelection" defaultMessage="Clear text" description="Tooltip for button on Textfield component to remove current text of the input" />}>
            <span>
              <ButtonMain
                iconCenter={<ClearIcon />}
                variant="contained"
                size="default"
                theme="lightText"
                className="int-clear-input__button--textfield"
                onClick={() => { onRemove(); }}
              />
            </span>
          </Tooltip>
          : null }
      </div>
      { helpContent && (
        <div className={cx(
          [inputStyles['help-container']],
          {
            'int-error__message--textfield': internalError,
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
  onRemove: null,
  placeholder: null,
  required: false,
  suppressInitialError: false,
  textArea: false,
  autoGrow: true,
  maxHeight: null,
  variant: 'contained',
  size: 'large',
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
  maxHeight: PropTypes.string,
  componentProps: PropTypes.object,
  onRemove: PropTypes.func,
  variant: PropTypes.oneOf(['contained', 'outlined']),
  size: PropTypes.oneOf(['small', 'large']),
};

export default TextField;
