/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CopyToClipboard from 'react-copy-to-clipboard';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import IconMoreVert from '../../icons/more_vert.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const messages = defineMessages({
  tooltip: {
    id: 'teamMembers.tooltip',
    defaultMessage: 'Manage member',
    description: 'Tooltip to call the menu for actions to perform on a single user',
  },
});

const TeamMemberActions = ({
  intl,
  setFlashMessage,
  team,
  teamUser,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [removeUserId, setRemoveUserId] = React.useState(null);

  const confirmRemoveUser = (id) => {
    setAnchorEl(null);
    setRemoveUserId(id);
  };

  const handleRemoveUser = (id) => {
    setAnchorEl(null);
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="The user has been removed"
          description="Success message when a user is removed from the workspace"
          id="teamMemberActions.userRemoved"
        />
      ), 'success');
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TeamMemberActionsRemoveUserMutation($input: DestroyTeamUserInput!) {
          destroyTeamUser(input: $input) {
            deletedId
            team {
              team_users(first: 10000, status: ["invited", "member", "banned"]) {
                edges {
                  node {
                    id
                    status
                    role
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          id,
        },
      },
      configs: [{
        type: 'RANGE_DELETE',
        parentID: team.id,
        connectionKeys: ['Team_teamUsers'],
        pathToConnection: ['team', 'team_users'],
        deletedIDFieldName: 'deletedId',
      }],
      onError: onFailure,
      onCompleted: (response, errors) => {
        if (errors) {
          return onFailure(errors);
        }
        return onSuccess();
      },
    });
  };

  const handleResendInvite = () => {
    setAnchorEl(null);
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Invite sent!"
          description="Success notification confirming that invitation was sent to user"
          id="teamMemberActions.invitationSent"
        />
      ), 'success');
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TeamMemberActionsResendInviteMutation($input: ResendCancelInvitationInput!) {
          resendCancelInvitation(input: $input) {
            success
          }
        }
      `,
      variables: {
        input: {
          email: teamUser.user.email,
          action: 'resend',
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

  const handleCancelInvite = () => {
    setAnchorEl(null);
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Invite canceled!"
          description="Success notification confirming that invitation was canceled"
          id="teamMemberActions.invitationCanceled"
        />
      ), 'success');
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TeamMemberActionsCancelInviteMutation($input: ResendCancelInvitationInput!) {
          resendCancelInvitation(input: $input) {
            success
            team {
              team_users(first: 10000, status: ["invited", "member", "banned"]) {
                edges {
                  node {
                    id
                    status
                    role
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          email: teamUser.user.email,
          action: 'cancel',
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

  const handleCopyToClipboard = () => {
    setAnchorEl(null);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="The email has been copied to the clipboard"
        description="success message fro when an email address has been copied to the clipboard"
        id="teamMemberActions.copiedToClipboard"
      />
    ), 'success');
  };

  if (!can(teamUser.permissions, 'update TeamUser')) {
    return null;
  }

  return (
    <React.Fragment>
      <ButtonMain
        iconCenter={<IconMoreVert className="team-members__icon-menu" />}
        size="default"
        theme="text"
        title={intl.formatMessage(messages.tooltip)}
        variant="outlined"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { teamUser.user.email ? (
          <CopyToClipboard text={teamUser.user.email} onCopy={handleCopyToClipboard}>
            <MenuItem>
              <FormattedMessage
                defaultMessage="Copy email"
                description="Menu item for copying email address to the clipboard"
                id="teamMembers.copyEmail"
              />
            </MenuItem>
          </CopyToClipboard>
        ) : null }
        <MenuItem
          onClick={() => (teamUser.status === 'invited' ?
            handleCancelInvite() :
            confirmRemoveUser(teamUser.id))
          }
        >
          <FormattedMessage
            defaultMessage="Remove"
            description="Menu item for removing a team member from the workspace"
            id="teamMembers.remove"
          />
        </MenuItem>
        { teamUser.status === 'invited' ? (
          <MenuItem onClick={() => handleResendInvite()}>
            <FormattedMessage
              defaultMessage="Resend invite"
              description="Menu item text to initiate an invitation email sent to the selected user"
              id="teamMembers.resendInvite"
            />
          </MenuItem>
        ) : null }
      </Menu>
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="{userLabel} will no longer have access to {teamName}'s workspace, including all content and files."
            description="explanation text about what will happen when a team member is removed from the workspace"
            id="teamMembers.removeDialogBody"
            values={{ userLabel: teamUser.user.name || teamUser.user.email, teamName: team.name }}
          />
        }
        open={Boolean(removeUserId)}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Remove"
            description="Confirmation label action for removing team member"
            id="teamMembers.removeConfrm"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Remove {userLabel}"
            description="Confirmation title for removing a team member"
            id="teamMembers.removeDialogTitle"
            values={{ userLabel: teamUser.user.name || teamUser.user.email }}
          />
        }
        onCancel={() => setRemoveUserId(null)}
        onProceed={() => handleRemoveUser(removeUserId)}
      />
    </React.Fragment>
  );
};


TeamMemberActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  teamUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(injectIntl(TeamMemberActions)), {
  teamUser: graphql`
    fragment TeamMemberActions_teamUser on TeamUser {
      id
      status
      permissions
      user {
        name
        email
      }
    }
  `,
  team: graphql`
    fragment TeamMemberActions_team on Team {
      id
      name
    }
  `,
});
