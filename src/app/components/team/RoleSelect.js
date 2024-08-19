/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Select from '../cds/inputs/Select';

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
  disabled,
  excludeRoles,
  intl,
  onChange,
  showLabel,
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
    <Select
      className="role-select"
      disabled={disabled}
      label={showLabel ? <FormattedMessage defaultMessage="Workspace permission" description="Label for select input for user to choose the permissions role for this user" id="roleSelect.selectLabel" /> : null}
      required={showLabel}
      value={value}
      onChange={onChange}
    >
      {
        filteredRoles.map(r => (
          <option className={`role-${r.value}`} key={r.value} value={r.value}>
            {r.label}
          </option>
        ))
      }
    </Select>
  );
};

RoleSelect.defaultProps = {
  disabled: false,
  excludeRoles: [],
  showLabel: false,
};

RoleSelect.propTypes = {
  disabled: PropTypes.bool,
  excludeRoles: PropTypes.arrayOf(PropTypes.string.isRequired),
  showLabel: PropTypes.bool,
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default injectIntl(RoleSelect);
