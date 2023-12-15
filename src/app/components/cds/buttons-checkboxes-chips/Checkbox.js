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
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div
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
          {
            [styles.disabled]: disabled,
          })
        }
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...inputProps}
        />
        {
          checked ? <CheckboxCheckedIcon
            className={cx(
              styles.checkboxIcon,
              styles.checked,
              {
                [styles.disabled]: disabled,
              },
            )}
          /> : <CheckboxUncheckedIcon
            className={cx(
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
