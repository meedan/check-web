import React from 'react';
import PropTypes from 'prop-types';
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
import ListItemText from '@material-ui/core/ListItemText';
import RoleSelect from './RoleSelect';
import Message from '../Message';
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
  const [errorMessage, setErrorMessage] = React.useState('');

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

    const onSuccess = (response) => {
      const { userInvitation: { errors } } = response;
      if (errors.length > 0) {
        const message = (
          errors.map(msg => (
            <ListItemText primary={msg.error} />
          ))
        );
        if (inviteEmails.length > errors.length) {
          message.push(
            <ListItemText
              primary={
                <FormattedMessage
                  id="inviteDialog.sentOtherInvitation"
                  defaultMessage="The other invites were sent successfully"
                  description="Message displayed when user sends multiple invitations but some emails fail and others succeed"
                />
              }
            />);
        }
        setErrorMessage(message);
      } else {
        setFlashMessage((
          <FormattedMessage
            id="inviteDialog.invitationSent"
            defaultMessage="Invites sent!"
            description="Success notification confirming that invitations were sent to users"
          />
        ), 'success');
        onClose();
      }
    };

    const invites = inviteEmails.map(email => ({
      email,
      role: inviteRole,
    }));

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation InviteDialogMutation($input: UserInvitationInput!) {
          userInvitation(input: $input) {
            errors
            team {
              id
              team_users(first: 10000, status: ["invited", "member", "banned"]) {
                edges {
                  node {
                    id
                    status
                    role
                    permissions
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
      onCompleted: onSuccess,
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
          description="Dialog title for inviting members to workspace"
        />
      </DialogTitle>
      <DialogContent>
        <Message message={errorMessage} />
        <TextField
          id="invite-dialog__email-input"
          name="invite-dialog__email-input"
          label={
            <FormattedMessage
              id="inviteDialog.textInputLabel"
              defaultMessage="Email addresses, comma separated"
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

InviteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default withSetFlashMessage(InviteDialog);
