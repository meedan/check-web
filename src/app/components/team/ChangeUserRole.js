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
  teamUser,
  setFlashMessage,
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
        open={Boolean(newRole)}
        title={
          <FormattedMessage
            id="changeUserRole.dialogTitle"
            defaultMessage="Are you sure you want to change {userLabel}'s role from {currentRole} to {newRole}?"
            description="Confirmation message to check if the user is sure they want to alter a user role"
            values={{
              userLabel: teamUser.user.name || teamUser.user.email,
              currentRole: teamUser.role,
              newRole,
            }}
          />
        }
        body={
          <>
            <FormattedMessage
              tagName="p"
              id="changeUserRole.changingTo"
              defaultMessage="You will be changing {userLabel}'s role to {newRole}."
              description="Description confirmation of what the current user role is, and what it will be changed to"
              values={{
                userLabel: teamUser.user.name || teamUser.user.email,
                newRole,
              }}
            />
            <FormattedMessage
              tagName="p"
              id="changeUserRole.learnMore"
              defaultMessage="To learn more about permissions for the {newRole} role, see the article about role permissions in our {helpCenterLink}."
              description="Help link to learn about roles and permissions for this application"
              values={{
                userLabel: teamUser.user.name || teamUser.user.email,
                newRole,
                helpCenterLink: (
                  <ExternalLink url="https://help.checkmedia.org/en/articles/3336431-permissions-in-check">
                    <FormattedMessage
                      id="changeUserRole.helpCenter"
                      defaultMessage="Help Center"
                      description="Link text to go to the help website"
                    />
                  </ExternalLink>
                ),
              }}
            />
          </>
        }
        onCancel={() => setNewRole(null)}
        onProceed={() => handleChangeRole(teamUser.id, newRole)}
        proceedLabel={
          <FormattedMessage
            id="changeUserRole.proceedLabel"
            defaultMessage="Change role to {newRole}"
            description="Dialog continuation label for altering a user role"
            values={{ newRole }}
          />
        }
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
