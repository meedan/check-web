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
import styles from './Select.module.css';
import Tooltip from '../alerts-and-prompts/Tooltip';

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
    <div className={className}>
      { (label || required) && (
        <div className={`${inputStyles['label-container']} ${error && inputStyles['error-label']}`}>
          { label && <label htmlFor="name">{label}</label> }
          { required && <span className={inputStyles.required}>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
        </div>
      )}
      <div className={styles['input-wrapper']}>
        <div className={`${inputStyles['input-container']} ${styles['select-container']}`}>
          { iconLeft && (
            <div className={inputStyles['input-icon-left-icon']}>
              {iconLeft}
            </div>
          )}
          <select
            id="check-select__input"
            className={`typography-body1 ${styles.input} ${variant === 'outlined' && styles.outlined} ${error && styles.error} ${iconLeft && styles['input-icon-left']}`}
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
          <Tooltip title={<FormattedMessage id="select.removeSelection" defaultMessage="Undo selection" description="Tooltip for button on Select component to remove current selection" />}>
            <ButtonMain
              iconCenter={<ClearIcon />}
              variant="contained"
              size="default"
              theme="lightText"
              className={cx('select__clear-button')}
              onClick={() => {
                inputRef.current.value = null;
                inputRef.current.selectedIndex = 0;
                onRemove();
              }}
            />
          </Tooltip>
          : null }
      </div>
      { helpContent && (
        <div className={`${inputStyles['help-container']} ${error && inputStyles['error-label']}`}>
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
  label: PropTypes.string,
  onRemove: PropTypes.func,
  required: PropTypes.bool,
  textArea: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default Select;

