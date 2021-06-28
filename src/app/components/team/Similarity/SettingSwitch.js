import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';

const SettingSwitch = ({
  label,
  checked,
  disabled,
  explainer,
  onChange,
}) => (
  <Box mb={2}>
    <Box display="flex" alignItems="center">
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <strong>{label}</strong>
    </Box>
    <Box ml={7}>
      {explainer}
    </Box>
  </Box>
);

SettingSwitch.defaultProps = {
  disabled: false,
  explainer: null,
};

SettingSwitch.propTypes = {
  label: PropTypes.node.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  explainer: PropTypes.node,
  onChange: PropTypes.func.isRequired,
};

export default SettingSwitch;
