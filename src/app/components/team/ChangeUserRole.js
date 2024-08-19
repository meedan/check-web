/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql, createFragmentContainer } from 'react-relay/compat';
import RoleSelect from './RoleSelect';
import { can } from '../Can';
import ExternalLink from '../ExternalLink';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const ChangeUserRole = ({
  setFlashMessage,
  teamUser,
}) => {
  const [newRole, setNewRole] = React.useState(null);

  const handleChangeRole = (id, role) => {
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    const onSuccess = () => {
      setNewRole(null);
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation ChangeUserRoleEditRoleMutation($input: UpdateTeamUserInput!) {
          updateTeamUser(input: $input) {
            team_user {
              id
              role
            }
          }
        }
      `,
      variables: {
        input: {
          id,
          role,
        },
      },
      onError: onFailure,
      onCompleted: (response, errors) => {
        if (errors) {
          return onFailure(errors);
        }
        return onSuccess();
      },
    });
  };

  return (
    <React.Fragment>
      <RoleSelect
        disabled={!can(teamUser.permissions, 'update TeamUser')}
        value={teamUser.role}
        onChange={e => setNewRole(e.target.value)}
      />
      <ConfirmProceedDialog
        body={
          <>
            <FormattedMessage
              defaultMessage="You will be changing {userLabel}'s role to {newRole}."
              description="Description confirmation of what the current user role is, and what it will be changed to"
              id="changeUserRole.changingTo"
              tagName="p"
              values={{
                userLabel: teamUser.user.name || teamUser.user.email,
                newRole,
              }}
            />
            <FormattedMessage
              defaultMessage="To learn more about permissions for the {newRole} role, see the article about role permissions in our {helpCenterLink}."
              description="Help link to learn about roles and permissions for this application"
              id="changeUserRole.learnMore"
              tagName="p"
              values={{
                userLabel: teamUser.user.name || teamUser.user.email,
                newRole,
                helpCenterLink: (
                  <ExternalLink url="https://help.checkmedia.org/en/articles/8712107-team-settings">
                    <FormattedMessage
                      defaultMessage="Help Center"
                      description="Link text to go to the help website"
                      id="changeUserRole.helpCenter"
                    />
                  </ExternalLink>
                ),
              }}
            />
          </>
        }
        open={Boolean(newRole)}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Change role to {newRole}"
            description="Dialog continuation label for altering a user role"
            id="changeUserRole.proceedLabel"
            values={{ newRole }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Are you sure you want to change {userLabel}'s role from {currentRole} to {newRole}?"
            description="Confirmation message to check if the user is sure they want to alter a user role"
            id="changeUserRole.dialogTitle"
            values={{
              userLabel: teamUser.user.name || teamUser.user.email,
              currentRole: teamUser.role,
              newRole,
            }}
          />
        }
        onCancel={() => setNewRole(null)}
        onProceed={() => handleChangeRole(teamUser.id, newRole)}
      />
    </React.Fragment>
  );
};

ChangeUserRole.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  teamUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(ChangeUserRole), {
  teamUser: graphql`
    fragment ChangeUserRole_teamUser on TeamUser {
      id
      status
      role
      permissions
      user {
        name
        email
      }
    }
  `,
});
