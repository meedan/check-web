import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { units } from '../../styles/js/shared';

const messages = defineMessages({
  collaborator: {
    id: 'RoleSelect.collaborator',
    defaultMessage: 'Collaborator',
  },
  editor: {
    id: 'RoleSelect.editor',
    defaultMessage: 'Editor',
  },
  admin: {
    id: 'RoleSelect.admin',
    defaultMessage: 'Admin',
  },
});

const RoleSelect = (props) => {
  const { excludeRoles, ...other } = props;

  const roles = [
    { value: 'collaborator', label: props.intl.formatMessage(messages.collaborator) },
    { value: 'editor', label: props.intl.formatMessage(messages.editor) },
    { value: 'admin', label: props.intl.formatMessage(messages.admin) },
  ];

  const filteredRoles = excludeRoles
    ? roles.filter(r => !excludeRoles.includes(r.value))
    : roles;

  return (
    <FormControl variant="outlined" style={{ minWidth: units(20), ...props.style }}>
      <Select
        className="role-select"
        input={<OutlinedInput name="role-select" labelWidth={0} />}
        {...other}
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
