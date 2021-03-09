import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql, createFragmentContainer } from 'react-relay/compat';
import RoleSelect from './RoleSelect';
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
    });
  };

  return (
    <React.Fragment>
      <RoleSelect
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
                  helpCenterLink: '',
                }}
              />
            </p>
          </div>
        }
        onCancel={() => setNewRole(null)}
        onProceed={() => handleChangeRole(teamUser.id, newRole)}
        proceedLabel={
          <FormattedMessage
            id="teamMembers.remove"
            defaultMessage="Remove"
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
      user {
        name
        email
      }
    }
  `,
});
