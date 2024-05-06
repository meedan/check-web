import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import * as EmailValidator from 'email-validator';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import Alert from '../cds/alerts-and-prompts/Alert';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import RoleSelect from './RoleSelect';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

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
      className={styles['dialog-window']}
      open={open}
      onClose={onClose}
      fullWidth
    >
      <div className={styles['dialog-title']}>
        <FormattedMessage
          tagName="h6"
          id="inviteDialog.title"
          defaultMessage="Invite workspace members"
          description="Dialog title for inviting members to workspace"
        />
      </div>
      <div className={styles['dialog-content']}>
        { errorMessage && <><Alert variant="error" contained title={errorMessage} /><br /></> }
        <div className={inputStyles['form-fieldset']}>
          <div className={inputStyles['form-fieldset-field']}>
            <FormattedMessage id="inviteDialog.textInputPlaceholder" defaultMessage="example: team_member@example.org, team_member2@example.org" description="Placeholder for input for invited emails">
              {placeholder => (
                <TextField
                  label={
                    <FormattedMessage
                      id="inviteDialog.textInputLabel"
                      defaultMessage="Email addresses"
                      description="Label to input for invited emails. Requires that multiple emails be entered separated by comma."
                    />
                  }
                  helpContent={
                    <FormattedMessage
                      id="inviteDialog.textInputHelp"
                      defaultMessage="To invite multiple members, separate email addresses with a comma"
                      description="Help to input for invited emails. Requires that multiple emails be entered separated by comma."
                    />
                  }
                  required
                  placeholder={placeholder}
                  onChange={handleChangeEmails}
                  componentProps={{
                    name: 'invite-dialog__email-input',
                    id: 'invite-dialog__email-input',
                  }}
                />
              )}
            </FormattedMessage>
          </div>
          <div className={inputStyles['form-fieldset-field']}>
            <RoleSelect value={inviteRole} onChange={handleChangeRole} showLabel />
          </div>
        </div>
      </div>
      <div className={styles['dialog-actions']}>
        <ButtonMain
          buttonProps={{
            id: 'invite-dialog__cancel',
          }}
          onClick={onClose}
          size="default"
          variant="text"
          theme="lightText"
          label={
            <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
          }
        />
        <ButtonMain
          buttonProps={{
            id: 'invite-dialog__submit',
          }}
          onClick={handleSubmit}
          size="default"
          variant="contained"
          theme="brand"
          disabled={inviteEmails.length < 1}
          label={
            <FormattedMessage id="inviteDialog.submit" defaultMessage="Invite" description="Button to submit invitations." />
          }
        />
      </div>
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
