/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import * as EmailValidator from 'email-validator';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import RoleSelect from './RoleSelect';
import Alert from '../cds/alerts-and-prompts/Alert';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const InviteDialog = ({
  onClose,
  open,
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
                  defaultMessage="The other invites were sent successfully"
                  description="Message displayed when user sends multiple invitations but some emails fail and others succeed"
                  id="inviteDialog.sentOtherInvitation"
                />
              }
            />);
        }
        setErrorMessage(message);
      } else {
        setFlashMessage((
          <FormattedMessage
            defaultMessage="Invites sent!"
            description="Success notification confirming that invitations were sent to users"
            id="inviteDialog.invitationSent"
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
      fullWidth
      open={open}
      onClose={onClose}
    >
      <div className={styles['dialog-title']}>
        <FormattedMessage
          defaultMessage="Invite workspace members"
          description="Dialog title for inviting members to workspace"
          id="inviteDialog.title"
          tagName="h6"
        />
      </div>
      <div className={styles['dialog-content']}>
        { errorMessage && <><Alert contained title={errorMessage} variant="error" /><br /></> }
        <div className={inputStyles['form-fieldset']}>
          <div className={inputStyles['form-fieldset-field']}>
            <FormattedMessage defaultMessage="example: team_member@example.org, team_member2@example.org" description="Placeholder for input for invited emails" id="inviteDialog.textInputPlaceholder">
              {placeholder => (
                <TextField
                  componentProps={{
                    name: 'invite-dialog__email-input',
                    id: 'invite-dialog__email-input',
                  }}
                  helpContent={
                    <FormattedMessage
                      defaultMessage="To invite multiple members, separate email addresses with a comma"
                      description="Help to input for invited emails. Requires that multiple emails be entered separated by comma."
                      id="inviteDialog.textInputHelp"
                    />
                  }
                  label={
                    <FormattedMessage
                      defaultMessage="Email addresses"
                      description="Label to input for invited emails. Requires that multiple emails be entered separated by comma."
                      id="inviteDialog.textInputLabel"
                    />
                  }
                  placeholder={placeholder}
                  required
                  onChange={handleChangeEmails}
                />
              )}
            </FormattedMessage>
          </div>
          <div className={inputStyles['form-fieldset-field']}>
            <RoleSelect showLabel value={inviteRole} onChange={handleChangeRole} />
          </div>
        </div>
      </div>
      <div className={styles['dialog-actions']}>
        <ButtonMain
          buttonProps={{
            id: 'invite-dialog__cancel',
          }}
          label={
            <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={onClose}
        />
        <ButtonMain
          buttonProps={{
            id: 'invite-dialog__submit',
          }}
          disabled={inviteEmails.length < 1}
          label={
            <FormattedMessage defaultMessage="Invite" description="Button to submit invitations." id="inviteDialog.submit" />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={handleSubmit}
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
