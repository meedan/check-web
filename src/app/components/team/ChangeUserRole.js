/* eslint-disable @calm/react-intl/missing-attribute */
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
            values={{
              userLabel: teamUser.user.name || teamUser.user.email,
              currentRole: teamUser.role,
              newRole,
            }}
          />
        }
        body={
          <div>
            <p>
              <FormattedMessage
                id="changeUserRole.changingTo"
                defaultMessage="You will be changing {userLabel}'s role to {newRole}."
                values={{
                  userLabel: teamUser.user.name || teamUser.user.email,
                  newRole,
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="changeUserRole.learnMore"
                defaultMessage="To learn more about permissions for the {newRole} role, see the article about role permissions in our {helpCenterLink}."
                values={{
                  userLabel: teamUser.user.name || teamUser.user.email,
                  newRole,
                  helpCenterLink: (
                    <ExternalLink url="https://help.checkmedia.org/en/articles/3336431-permissions-in-check">
                      <FormattedMessage
                        id="changeUserRole.helpCenter"
                        defaultMessage="Help Center"
                      />
                    </ExternalLink>
                  ),
                }}
              />
            </p>
          </div>
        }
        onCancel={() => setNewRole(null)}
        onProceed={() => handleChangeRole(teamUser.id, newRole)}
        proceedLabel={
          <FormattedMessage
            id="changeUserRole.proceedLabel"
            defaultMessage="Change role to {newRole}"
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
