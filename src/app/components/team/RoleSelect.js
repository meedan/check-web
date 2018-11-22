import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';

const messages = defineMessages({
  annotator: {
    id: 'RoleSelect.annotator',
    defaultMessage: 'Annotator',
  },
  contributor: {
    id: 'RoleSelect.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'RoleSelect.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'RoleSelect.editor',
    defaultMessage: 'Editor',
  },
  owner: {
    id: 'RoleSelect.owner',
    defaultMessage: 'Owner',
  },
});

const RoleSelect = (props) => {
  const roles = [
    { value: 'annotator', label: props.intl.formatMessage(messages.annotator) },
    { value: 'contributor', label: props.intl.formatMessage(messages.contributor) },
    { value: 'journalist', label: props.intl.formatMessage(messages.journalist) },
    { value: 'editor', label: props.intl.formatMessage(messages.editor) },
    { value: 'owner', label: props.intl.formatMessage(messages.owner) },
  ];

  return (
    <FormControl variant="outlined">
      <Select
        className="role-select"
        style={{ width: '150px' }}
        input={<OutlinedInput name="role-select" labelWidth={0} />}
        {...props}
      >
        {
          roles.map(r => (
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
