import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import * as EmailValidator from 'email-validator';
import RoleSelect from './RoleSelect';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import UserInvitationMutation from '../../relay/mutations/UserInvitationMutation';
import { withSetFlashMessage } from '../FlashMessage';
import {
  StyledIconButton,
  Row,
  FlexRow,
} from '../../styles/js/shared';

const messages = defineMessages({
  inviteEmailInput: {
    id: 'TeamInviteMembers.emailInput',
    defaultMessage: 'Email address',
  },
  inviteEmailMultipleInput: {
    id: 'TeamInviteMembers.emailMultipleInput',
    defaultMessage: 'Separate emails by commas',
  },
  invalidEmail: {
    id: 'TeamInviteMembers.invalidEmail',
    defaultMessage: 'Not a valid email address.',
  },
  memberEmail: {
    id: 'TeamInviteMembers.existsEmail',
    defaultMessage: 'Already a member.',
  },
  invitedEmail: {
    id: 'TeamInviteMembers.invitedEmail',
    defaultMessage: 'Already invited.',
  },
  contributor: {
    id: 'TeamMembersListItem.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'TeamMembersListItem.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'TeamMembersListItem.editor',
    defaultMessage: 'Editor',
  },
  annotator: {
    id: 'TeamMembersListItem.annotator',
    defaultMessage: 'Annotator',
  },
});

class TeamInviteMembers extends Component {
  static validateEmail(email, invitedEmails, membersEmails) {
    let error = null;
    const inputEmail = email.trim();
    if (EmailValidator.validate(inputEmail) === false) {
      error = 'invalid';
    } else if (invitedEmails.has(inputEmail) === true) {
      error = 'invited';
    } else if (membersEmails.has(inputEmail) === true) {
      error = 'member';
    }
    return error;
  }

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      sendDisabled: true,
      membersToInvite: [{ email: '', role: 'contributor', errors: [] }],
      addMany: false,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      sendDisabled: true,
      addMany: false,
      membersToInvite: [{ email: '', role: 'contributor', errors: [] }],
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      sendDisabled: true,
      addMany: false,
      membersToInvite: [{ email: '', role: 'contributor', errors: [] }],
    });
  }

  handleAddAnother() {
    this.setState({
      membersToInvite: [...this.state.membersToInvite, { email: '', role: 'contributor', errors: [] }],
    });
  }

  handleAddMany() {
    this.setState({
      addMany: true,
      sendDisabled: true,
      membersToInvite: [{ email: '', role: 'contributor', errors: [] }],
    });
  }

  handleAddSeparate() {
    this.setState({
      addMany: false,
      sendDisabled: true,
      membersToInvite: [{ email: '', role: 'contributor', errors: [] }],
    });
  }

  handleRemoveEmail(index) {
    this.state.membersToInvite.splice(index, 1);
    const emptyEmails = this.state.membersToInvite.every(obj => !obj.email);
    this.setState({ membersToInvite: this.state.membersToInvite, sendDisabled: emptyEmails });
  }

  handleEmailChange(e, index) {
    this.state.membersToInvite[index].email = e.target.value;
    const emptyEmails = this.state.membersToInvite.every(obj => !obj.email);
    this.setState({ membersToInvite: this.state.membersToInvite, sendDisabled: emptyEmails });
  }

  handleRoleChange(e, index) {
    this.state.membersToInvite[index].role = e.target.value;
    this.setState({ membersToInvite: this.state.membersToInvite });
  }

  validateMembers() {
    const { team } = this.props;
    const invitedEmails = new Set(team.invited_mails);
    const membersEmails = new Set();
    team.team_users.edges.forEach(({ node: { status, user } }) => {
      if (status === 'member' && user && user.email) {
        membersEmails.add(user.email);
      }
    });
    this.state.membersToInvite.forEach((item, index) => {
      this.state.membersToInvite[index].errors = [];
      if (item.email) {
        if (this.state.addMany) {
          item.email.split(',').map(email => email.trim()).filter(email => !!email).forEach((email) => {
            const error = TeamInviteMembers.validateEmail(email, invitedEmails, membersEmails);
            if (error) {
              this.state.membersToInvite[index].errors.push({ key: error, email });
            }
          });
        } else {
          const error = TeamInviteMembers.validateEmail(item.email, invitedEmails, membersEmails);
          if (error) {
            this.state.membersToInvite[index].errors.push({ key: error, email: item.email });
          }
        }
      }
    });
    this.setState({ membersToInvite: this.state.membersToInvite });
    return this.state.membersToInvite.every(member => !member.errors.length);
  }

  handleSubmit() {
    const onFailure = () => {
    };

    const onSuccess = (response) => {
      const { userInvitation: { success } } = response;
      this.setState({
        dialogOpen: false,
      });
      if (success.length > 0) {
        const errorMessage = (
          success.map((message, index) => (
            <p key={`email-error-${index.toString()}`}>{message.email} : {message.error}</p>
          ))
        );
        this.props.setFlashMessage(errorMessage);
      } else {
        const message = (
          <FormattedMessage
            id="teamInviteMembers.resendEmailSuccess"
            defaultMessage="Invitation was sent successfully"
          />
        );
        this.props.setFlashMessage(message);
      }
    };
    if (this.validateMembers() && !this.state.sendDisabled) {
      // FIXME Don't read from the DOM.
      const invitation = document.getElementById('invite-msg-input').value.trim();
      Relay.Store.commitUpdate(
        new UserInvitationMutation({
          invitation,
          members: JSON.stringify(this.state.membersToInvite),
        }),
        { onSuccess, onFailure },
      );
    }
  }

  renderError(item) {
    switch (item.key) {
    case 'invalid':
      return this.props.intl.formatMessage(messages.invalidEmail);
    case 'member':
      return this.props.intl.formatMessage(messages.memberEmail);
    case 'invited':
      return this.props.intl.formatMessage(messages.invitedEmail);
    default:
      return null;
    }
  }

  render() {
    const excludeRoles = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner' ? [] : ['owner'];
    let inviteBody = null;
    if (this.state.addMany) {
      inviteBody = (
        this.state.membersToInvite.map((member, index) => (
          <div key={`invite-team-member-new-${index.toString()}`}>
            <FlexRow>
              <FormattedMessage id="teamInviteMembers.inviteMembers" defaultMessage="Members will be invited as" />
              <RoleSelect
                className="invite-member-email-role"
                onChange={e => this.handleRoleChange(e, index)}
                value={member.role}
                excludeRoles={excludeRoles}
              />
            </FlexRow>
            <TextField
              key="invite-member-email-input"
              id={index.toString()}
              className="invite-member-email-input"
              label={this.props.intl.formatMessage(messages.inviteEmailMultipleInput)}
              multiline
              fullWidth
              margin="normal"
              variant="outlined"
              rows={4}
              onChange={e => this.handleEmailChange(e, index)}
              value={member.email}
              error={member.errors.length > 0}
              helperText={
                member.errors.map(errorItem => `${errorItem.email}: ${this.renderError(errorItem)}`).join(' ')
              }
            />
          </div>
        ))
      );
    } else {
      inviteBody = (
        this.state.membersToInvite.map((member, index) => (
          <div key={`invite-team-member-new-${index.toString()}`}>
            <Row>
              <TextField
                key="invite-member-email-input"
                className="invite-member-email-input"
                id={index.toString()}
                placeholder={this.props.intl.formatMessage(messages.inviteEmailInput)}
                onChange={e => this.handleEmailChange(e, index)}
                value={member.email}
                error={member.errors.length > 0}
                helperText={
                  member.errors.map(errorItem => this.renderError(errorItem)).join(' ')
                }
                margin="normal"
                fullWidth
              />
              <Box clone ml={2} my={1}>
                <Row>
                  <RoleSelect
                    className="invite-member-email-role"
                    onChange={e => this.handleRoleChange(e, index)}
                    value={member.role}
                    excludeRoles={excludeRoles}
                  />
                  <StyledIconButton
                    className="invite-member-email-remove-button"
                    onClick={() => this.handleRemoveEmail(index)}
                  >
                    <CancelIcon />
                  </StyledIconButton>
                </Row>
              </Box>
            </Row>
          </div>
        ))
      );
    }

    return (
      <FlexRow>
        <Box clone ml="auto" mr={2}>
          <Button
            variant="contained"
            onClick={this.handleOpenDialog.bind(this)}
            className="team-members__invite-button"
          >
            <FormattedMessage id="teamInviteMembers.inviteMember" defaultMessage="Invite" />
          </Button>
        </Box>
        <Dialog
          className="team-invite-members__dialog"
          open={this.state.dialogOpen}
          onClose={this.handleCloseDialog.bind(this)}
          scroll="paper"
          fullWidth
        >
          <DialogTitle><FormattedMessage id="TeamInviteMembers.newInvite" defaultMessage="Invite members" /></DialogTitle>
          <DialogContent>
            <TextField
              id="invite-msg-input"
              className="team-invite-members__input"
              label={
                <FormattedMessage id="teamInviteMembers.customInvitation" defaultMessage="Invitation note (optional)" />
              }
              fullWidth
              multiline
              rows={2}
              margin="normal"
              variant="outlined"
            />
            { inviteBody }
            { this.state.addMany ?
              <Box height={6}>
                <Row>
                  <Button
                    className="team-invite-members__dialog-add-separate-button"
                    onClick={this.handleAddSeparate.bind(this)}
                  >
                    <FormattedMessage id="teamInviteMembers.addSeparate" defaultMessage="Add separate" />
                  </Button>
                </Row>
              </Box> :
              <Box height={12}>
                <Row>
                  <Button
                    className="team-invite-members__dialog-add-another-button"
                    onClick={this.handleAddAnother.bind(this)}
                  >
                    <FormattedMessage id="teamInviteMembers.addAnother" defaultMessage="Add another" />
                  </Button>
                  <Button
                    className="team-invite-members__dialog-add-many-button"
                    onClick={this.handleAddMany.bind(this)}
                  >
                    <FormattedMessage id="teamInviteMembers.addMany" defaultMessage="Add many" />
                  </Button>
                </Row>
              </Box>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog.bind(this)}>
              <FormattedMessage id="teamInviteMembers.cancelAdd" defaultMessage="Cancel" />
            </Button>
            <Button
              className="team-invite-members__dialog-submit-button"
              onClick={this.handleSubmit.bind(this)}
              color="primary"
              disabled={this.state.sendDisabled}
            >
              <FormattedMessage id="teamInviteMembers.send" defaultMessage="Send" />
            </Button>
          </DialogActions>
        </Dialog>
      </FlexRow>
    );
  }
}

TeamInviteMembers.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

TeamInviteMembers.contextTypes = {
  store: PropTypes.object,
};

export default Relay.createContainer(withSetFlashMessage(injectIntl(TeamInviteMembers)), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        invited_mails
        team_users(first: 10000) {
          edges {
            node {
              status
              user {
                email
              }
            }
          }
        }
      }
    `,
  },
});
