import React from 'react';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';

const SettingSwitch = ({
  label,
  checked,
  explainer,
  onChange,
}) => (
  <Box mb={2}>
    <Box display="flex" alignItems="center">
      <Switch
        checked={checked}
        onChange={onChange}
      />
      <strong>{label}</strong>
    </Box>
    <Box ml={7}>
      {explainer}
    </Box>
  </Box>
);

// TODO: PropTypes

export default SettingSwitch;
