import React from 'react';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import * as EmailValidator from 'email-validator';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import RoleSelect from './RoleSelect';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import globalStrings from '../../globalStrings';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const InviteDialog = ({
  open,
  onClose,
  setFlashMessage,
  team,
}) => {
  const [inviteEmails, setInviteEmails] = React.useState([]);
  const [inviteRole, setInviteRole] = React.useState('collaborator');

  const handleChangeEmails = (e) => {
    const emails = e.target.value.split(',');

    const validEmails = emails
      .map(email => email.trim())
      .filter(email => EmailValidator.validate(email));

    setInviteEmails(validEmails);
  };

  const handleChangeRole = (e) => {
    setInviteRole(e.target.value);
  };

  const handleSubmit = () => {
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          id="inviteDialog.invitationSent"
          defaultMessage="Invites sent!"
          description="Sucess notification confirming that invitations were sent to users"
        />
      ), 'success');
      onClose();
    };

    const invites = inviteEmails.map(email => ({
      email,
      role: inviteRole,
    }));

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation InviteDialogMutation($input: UserInvitationInput!) {
          userInvitation(input: $input) {
            success
            team {
              id
              team_users(first: 10000, status: ["invited", "member", "banned"]) {
                edges {
                  node {
                    id
                    status
                    role
                    user {
                      id
                      dbid
                      email
                      is_bot
                      name
                      profile_image
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          members: JSON.stringify(invites),
        },
      },
      configs: [{
        type: 'RANGE_ADD',
        parentID: team.id,
        connectionInfo: [{
          key: 'Team_teamUsers',
          rangeBehavior: 'append',
        }],
        edgeName: 'team_userEdge',
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>
        <FormattedMessage
          id="inviteDialog.title"
          defaultMessage="Invite workspace members"
          description="Invite workspace members dialog title"
        />
      </DialogTitle>
      <DialogContent>
        <TextField
          label={
            <FormattedMessage
              id="inviteDialog.textInputLabel"
              defaultMessage="Emails, comma separated"
              description="Label to input for invited emails. Requires that multiple emails be entered separated by comma."
            />
          }
          margin="normal"
          onChange={handleChangeEmails}
          fullWidth
          variant="outlined"
        />
        <RoleSelect value={inviteRole} onChange={handleChangeRole} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button
          id="invite-dialog__cancel"
          onClick={onClose}
        >
          <FormattedMessage {...globalStrings.cancel} />
        </Button>
        <Button
          id="invite-dialog__submit"
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={inviteEmails.length < 1}
        >
          <FormattedMessage id="inviteDialog.submit" defaultMessage="Invite" description="Button to submit invitations." />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withSetFlashMessage(InviteDialog);
