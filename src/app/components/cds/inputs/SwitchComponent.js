import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styles from './Switch.module.css';

const SwitchComponent = ({
  checked,
  disabled,
  label,
  labelPlacement,
  helperContent,
  onChange,
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <div className={styles.switchWrapper}>
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
              }}
            />
          </div>
        }
        labelPlacement={labelPlacement}
        value={labelPlacement}
        label={label}
      />
      { helperContent ?
        <div className={styles.helper}>
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
  labelPlacement: '',
  helperContent: '',
  onChange: null,
};

SwitchComponent.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.object,
  labelPlacement: PropTypes.string,
  helperContent: PropTypes.string,
  onChange: PropTypes.func,
};

export default SwitchComponent;
