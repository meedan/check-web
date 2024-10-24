/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=34-5720&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ClearIcon from '../../../icons/clear.svg';
import ErrorIcon from '../../../icons/error.svg';
import ChevronDownIcon from '../../../icons/chevron_down.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './Select.module.css';

const Select = ({
  children,
  className,
  disabled,
  error,
  helpContent,
  iconLeft,
  label,
  onRemove,
  required,
  textArea,
  variant,
  ...inputProps
}) => {
  const inputRef = React.useRef(null);
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
        <div
          className={cx(
            inputStyles['label-container'],
            {
              [inputStyles['error-label']]: error,
              [styles['select-removeable']]: onRemove,
              [inputStyles['label-container-label']]: label,
              [inputStyles['label-container-required']]: required,
            })
          }
        >
          { label && <label htmlFor="name">{label}</label> }
          { required && <span className={inputStyles.required}>*<FormattedMessage defaultMessage="Required" description="A label to indicate that a form field must be filled out" id="textfield.required" /></span>}
        </div>
      )}
      <div className={styles['select-wrapper']}>
        <div className={cx(inputStyles['input-container'], styles['select-container'])}>
          { iconLeft && (
            <div className={inputStyles['input-icon-left-icon']}>
              {iconLeft}
            </div>
          )}
          <select
            className={cx(
              'cds-input-select',
              styles.input,
              {
                [className]: true,
                [styles.outlined]: variant === 'outlined',
                [styles.error]: error,
                [styles['input-icon-left']]: iconLeft,
              })
            }
            disabled={disabled}
            ref={inputRef}
            {...inputProps}
          >
            {children}
          </select>
          <div className={inputStyles['input-icon-right-icon']}>
            <ChevronDownIcon />
          </div>
        </div>
        { onRemove ?
          <Tooltip arrow title={<FormattedMessage defaultMessage="Undo selection" description="Tooltip for button on Select component to remove current selection" id="select.removeSelection" />}>
            <span>
              <ButtonMain
                className="select__clear-button"
                iconCenter={<ClearIcon />}
                size="default"
                theme="lightText"
                variant="contained"
                onClick={() => {
                  inputRef.current.value = null;
                  inputRef.current.selectedIndex = 0;
                  onRemove();
                }}
              />
            </span>
          </Tooltip>
          : null }
      </div>
      { helpContent && (
        <div
          className={cx(
            inputStyles['help-container'],
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
};

Select.defaultProps = {
  className: '',
  disabled: false,
  error: false,
  helpContent: null,
  iconLeft: null,
  label: '',
  onRemove: null,
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
  label: PropTypes.node,
  onRemove: PropTypes.func,
  required: PropTypes.bool,
  textArea: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default Select;

