import React from 'react';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CopyToClipboard from 'react-copy-to-clipboard';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const TeamMemberActions = ({
  setFlashMessage,
  teamUser,
  team,
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
          id="teamMemberActions.invitationSent"
          defaultMessage="Invite sent!"
          description="Sucess notification confirming that invitation was sent to user"
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

  const handleCopyToClipboard = () => {
    setAnchorEl(null);
    setFlashMessage((
      <FormattedMessage
        id="teamMemberActions.copiedToClipboard"
        defaultMessage="The email has been copied to the clipboard"
      />
    ), 'success');
  };

  return (
    <React.Fragment>
      <IconButton
        tooltip={<FormattedMessage id="teamMembers.tooltip" defaultMessage="Manage member" />}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <IconMoreVert className="team-members__icon-menu" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { teamUser.user.email ? (
          <CopyToClipboard text={teamUser.user.email} onCopy={handleCopyToClipboard}>
            <MenuItem>
              <FormattedMessage
                id="teamMembers.copyEmail"
                defaultMessage="Copy email"
              />
            </MenuItem>
          </CopyToClipboard>
        ) : null }
        <MenuItem onClick={() => confirmRemoveUser(teamUser.id)}>
          <FormattedMessage
            id="teamMembers.remove"
            defaultMessage="Remove"
          />
        </MenuItem>
        { teamUser.status === 'invited' ? (
          <MenuItem onClick={() => handleResendInvite()}>
            <FormattedMessage
              id="teamMembers.resendInvite"
              defaultMessage="Resend invite"
            />
          </MenuItem>
        ) : null }
      </Menu>
      <ConfirmProceedDialog
        open={Boolean(removeUserId)}
        title={
          <FormattedMessage
            id="teamMembers.removeDialogTitle"
            defaultMessage="Remove {userLabel}"
            values={{ userLabel: teamUser.user.name || teamUser.user.email }}
          />
        }
        body={
          <FormattedMessage
            id="teamMembers.removeDialogBody"
            defaultMessage="{userLabel} will no longer have access to {teamName}'s workspace, including all content, lists and files."
            values={{ userLabel: teamUser.user.name || teamUser.user.email, teamName: team.name }}
          />
        }
        onCancel={() => setRemoveUserId(null)}
        onProceed={() => handleRemoveUser(removeUserId)}
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

export default withSetFlashMessage(TeamMemberActions);
