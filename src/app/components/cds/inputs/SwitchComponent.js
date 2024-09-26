// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=194-3449&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { Switch } from '@material-ui/core';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Switch.module.css';

const SwitchComponent = ({
  checked,
  className,
  disabled,
  helperContent,
  inputProps,
  label,
  labelPlacement,
  onChange,
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div
      className={cx(
        styles.switchWrapper,
        inputStyles['input-wrapper'],
        styles[`label-placement-${labelPlacement}`],
        {
          [className]: true,
          [inputStyles.disabled]: disabled,
          [styles['switch-disabled']]: disabled,
        })
      }
    >
      <label>
        { label && (
          <div className={cx(
            [inputStyles['label-container']],
            styles.switchLabel,
            {
              [inputStyles['label-container-label']]: label,
            })
          }
          >
            {label}
          </div>
        )}
        <div className={styles.switch}>
          <Switch
            checked={checked}
            classes={{
              root: styles.switchRoot,
              switchBase: styles.switchBase,
              thumb: styles.thumb,
              track: styles.track,
              checked: styles.checked,
            }}
            disabled={disabled}
            name="checked"
            onChange={handleChange}
            {...inputProps}
          />
        </div>
      </label>
      { helperContent &&
        <div className={cx([inputStyles['help-container'], styles['switch-help-container']])}>
          {helperContent}
        </div>
      }
    </div>
  );
};

SwitchComponent.defaultProps = {
  checked: false,
  disabled: false,
  label: null,
  labelPlacement: 'end',
  helperContent: '',
  onChange: null,
  className: '',
  inputProps: {},
};

SwitchComponent.propTypes = {
  checked: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  helperContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  inputProps: PropTypes.object,
  label: PropTypes.node,
  labelPlacement: PropTypes.oneOf(['bottom', 'end', 'start', 'top']),
  onChange: PropTypes.func,
};

export default SwitchComponent;
