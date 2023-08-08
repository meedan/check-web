// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=194-3449&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { Switch } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './Switch.module.css';

const SwitchComponent = ({
  inputProps,
  checked,
  disabled,
  label,
  labelPlacement,
  helperContent,
  onChange,
  className,
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div className={cx(styles.switchWrapper, className)}>
      <FormControlLabel
        control={
          <div className={styles.switch}>
            <Switch
              checked={checked}
              onChange={handleChange}
              name="checked"
              disabled={disabled}
              classes={{
                root: styles.switchRoot,
                switchBase: styles.switchBase,
                thumb: styles.thumb,
                track: styles.track,
                checked: styles.checked,
                disabled: styles.disabled,
              }}
              {...inputProps}
            />
          </div>
        }
        labelPlacement={labelPlacement}
        value={labelPlacement}
        label={label}
      />
      { helperContent ?
        <div className={cx([inputStyles['help-container'], styles['switch-help-container']])}>
          {helperContent}
        </div>
        : null }
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
  disabled: PropTypes.bool,
  label: PropTypes.object,
  className: PropTypes.string,
  labelPlacement: PropTypes.oneOf(['bottom', 'end', 'start', 'top']),
  helperContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  inputProps: PropTypes.object,
};

export default SwitchComponent;
