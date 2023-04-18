import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styles from './Switch.module.css';

const SwitchComponent = ({
  label,
  disabled,
  labelPlacement,
  helperContent,
}) => {
  const [state, setState] = React.useState({
    checked: false,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <FormControlLabel
      control={
        <div className={styles.switch}>
          <Switch
            checked={state.checked}
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
          { helperContent ?
            <div className={['typography-caption', styles.helper].join(' ')}>
              {helperContent}
            </div>
            : null }
        </div>
      }
      labelPlacement={labelPlacement}
      value={labelPlacement}
      label={
        <span className={['typography-body2', styles.label].join(' ')}>
          {label}
        </span>
      }
    />
  );
};

SwitchComponent.defaultProps = {
  disabled: false,
  label: null,
  labelPlacement: '',
  helperContent: '',
};

SwitchComponent.propTypes = {
  label: PropTypes.object,
  disabled: PropTypes.bool,
  labelPlacement: PropTypes.string,
  helperContent: PropTypes.string,
};

// eslint-disable-next-line import/no-unused-modules
export default SwitchComponent;
