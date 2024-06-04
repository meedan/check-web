// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=194-3449&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import inputStyles from '../../../styles/css/inputs.module.css';
import CheckboxUncheckedIcon from '../../../icons/check_box_outline_blank.svg';
import CheckboxCheckedIcon from '../../../icons/check_box.svg';
import styles from './Checkbox.module.css';

const Checkbox = ({
  inputProps,
  checked,
  disabled,
  label,
  onChange,
  className,
}) => {
  const swallowClick = (ev) => {
    // prevent click events on items "under" the checkbox from firing when we click the link
    ev.stopPropagation();
  };

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div
      onKeyPress={swallowClick}
      onClick={swallowClick}
      className={cx(
        styles.checkboxWrapper,
        inputStyles['input-wrapper'],
        {
          [className]: true,
          [inputStyles.disabled]: disabled,
        })
      }
    >
      <label
        className={cx(
          'typography-body2',
          'int-checkbox__label',
          {
            [styles.disabled]: disabled,
          })
        }
      >
        <input
          className="int-checkbox__input"
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onClick={swallowClick}
          disabled={disabled}
          {...inputProps}
        />
        {
          checked ? <CheckboxCheckedIcon
            className={cx(
              'int-checkbox__input-icon--checked',
              styles.checkboxIcon,
              styles.checked,
              {
                [styles.disabled]: disabled,
              },
            )}
          /> : <CheckboxUncheckedIcon
            className={cx(
              'int-checkbox__input-icon--unchecked',
              styles.checkboxIcon,
              {
                [styles.disabled]: disabled,
              },
            )}
          />
        }
        <span>{label}</span>
      </label>
    </div>
  );
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  label: null,
  onChange: null,
  className: '',
  inputProps: {},
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func,
  inputProps: PropTypes.object,
};

export default Checkbox;
