import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { units } from '../../styles/js/shared';

const messages = defineMessages({
  collaborator: {
    id: 'roleSelect.collaborator',
    defaultMessage: 'Collaborator',
  },
  editor: {
    id: 'roleSelect.editor',
    defaultMessage: 'Editor',
  },
  admin: {
    id: 'roleSelect.admin',
    defaultMessage: 'Admin',
  },
});

const RoleSelect = ({
  excludeRoles,
  fullWidth,
  intl,
  onChange,
  value,
}) => {
  const roles = [
    { value: 'collaborator', label: intl.formatMessage(messages.collaborator) },
    { value: 'editor', label: intl.formatMessage(messages.editor) },
    { value: 'admin', label: intl.formatMessage(messages.admin) },
  ];

  const filteredRoles = excludeRoles
    ? roles.filter(r => !excludeRoles.includes(r.value))
    : roles;

  return (
    <FormControl
      variant="outlined"
      style={{ minWidth: units(20) }}
      fullWidth={fullWidth}
    >
      <Select
        className="role-select"
        input={<OutlinedInput name="role-select" labelWidth={0} />}
        onChange={onChange}
        value={value}
      >
        {
          filteredRoles.map(r => (
            <MenuItem className={`role-${r.value}`} key={r.value} value={r.value}>
              {r.label}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

export default injectIntl(RoleSelect);
