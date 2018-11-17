import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Select from 'react-select';
import RaisedButton from 'material-ui/RaisedButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import MdCancel from 'react-icons/lib/md/cancel';
import * as EmailValidator from 'email-validator';
import UserInvitationMutation from '../../relay/mutations/UserInvitationMutation';
import {
  units,
  selectStyle,
  StyledIconButton,
  Row,
  FlexRow,
} from '../../styles/js/shared';
import {
  StyledHelper,
} from '../../styles/js/HeaderCard';

const messages = defineMessages({
  inviteMembers: {
    id: 'TeamInviteMembers.newInvite',
    defaultMessage: 'Invite members',
  },
  inviteEmailInput: {
    id: 'TeamInviteMembers.emailInput',
    defaultMessage: 'Email address',
  },
  inviteEmailMultipleInput: {
    id: 'TeamInviteMembers.emailMultipleInput',
    defaultMessage: 'Separate by commas',
  },
  invalidEmail: {
    id: 'TeamInviteMembers.invalidEmail',
    defaultMessage: 'Not a valid email address.',
  },
  memberEmail: {
    id: 'TeamInviteMembers.existsEmail',
    defaultMessage: 'Already a team member.',
  },
  invitedEmail: {
    id: 'TeamInviteMembers.invitedEmail',
    defaultMessage: 'Already invited to this team.',
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
    if (EmailValidator.validate(email) === false) {
      error = 'invalid';
    } else if (invitedEmails.includes(email) === true) {
      error = 'invited';
    } else if (membersEmails.includes(email) === true) {
      error = 'member';
    }
    return error;
  }

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      membersToInvite: [{ email: '', role: 'contributor', error: [] }],
      addMany: false,
      errors: [],
    };
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      sendDisabled: true,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      sendDisabled: true,
      addMany: false,
      membersToInvite: [{ email: '', role: 'contributor', error: [] }],
      errors: [],
    });
  }

  handleAddAnother() {
    this.setState({
      membersToInvite: [...this.state.membersToInvite, { email: '', role: 'contributor', error: [] }],
    });
  }

  handleAddMany() {
    this.setState({
      addMany: true,
      sendDisabled: true,
      errors: [],
      membersToInvite: [{ email: '', role: 'contributor', error: [] }],
    });
  }

  handleRemoveEmail(index) {
    this.state.membersToInvite.splice(index, 1);
    this.setState({ membersToInvite: this.state.membersToInvite });
    const emptyEmails = this.state.membersToInvite.every(obj => obj.email === '');
    this.setState({ sendDisabled: emptyEmails });
  }

  handleEmailChange(e, index) {
    this.state.membersToInvite[index].email = e.target.value;
    this.setState({ membersToInvite: this.state.membersToInvite });
    const emptyEmails = this.state.membersToInvite.every(obj => obj.email === '');
    this.setState({ sendDisabled: emptyEmails });
  }

  handleRoleChange(e, index) {
    this.state.membersToInvite[index].role = e.value;
    this.setState({ membersToInvite: this.state.membersToInvite });
  }

  validateMembers(members) {
    const { limits, members_count: membersCount } = this.props.team;
    const { invited_mails: invitedEmails, team_users: teamUsers } = this.props.team;
    let invitedCount = 0;
    const membersEmails = [];
    teamUsers.edges.map((teamUser) => {
      if (teamUser.node.user.email !== null) {
        return membersEmails.push(teamUser.node.user.email);
      }
      return null;
    });
    let emailError = null;
    members.forEach((item, index) => {
      const errors = [];
      if (item.email !== '') {
        if (this.state.addMany) {
          const emails = item.email.split(',');
          emails.forEach((x) => {
            invitedCount += 1;
            emailError = TeamInviteMembers.validateEmail(x, invitedEmails, membersEmails);
            if (emailError !== null) {
              errors.push({ key: emailError, email: x });
            }
          });
        } else {
          invitedCount += 1;
          emailError = TeamInviteMembers.validateEmail(item.email, invitedEmails, membersEmails);
          if (emailError !== null) {
            errors.push({ key: emailError, email: item.email });
          }
        }
        this.state.membersToInvite[index].error = errors;
      }
    });
    this.setState({ membersToInvite: this.state.membersToInvite });
    const allMembers = invitedEmails.length + membersCount + invitedCount;
    if (limits.max_number_of_members !== 0 && limits.max_number_of_members < allMembers) {
      const maxMembers = limits.max_number_of_members - (invitedEmails.length + membersCount);
      this.setState({ errors: [{ key: 'limits', maxMembers }] });
    } else {
      this.setState({ errors: [] });
    }
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
        this.context.setMessage('Invitations sent successfully');
      }
    };
    this.validateMembers(this.state.membersToInvite);
    const membersList = this.state.membersToInvite;
    const isValid = membersList.every(obj => obj.error.length === 0);
    if (!isValid || this.state.errors.length > 0) {
      return;
    }
    if (isValid && !this.state.sendDisabled) {
      const invitation = document.getElementById('invite-msg-input').value.trim();
      const members = JSON.stringify(membersList);
      Relay.Store.commitUpdate(
        new UserInvitationMutation({
          invitation,
          members,
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
    case 'limits':
      return (
        <FormattedMessage
          id="teamInviteMembers.limits"
          defaultMessage="The maximum number of users for this team has been reached, allowed to invite {count, plural, =0 {0 members} one {1 member} other {# members}}."
          values={{ count: item.maxMembers }}
        />
      );
    default:
      return null;
    }
  }

  render() {
    const roles = [
      { value: 'contributor', label: this.props.intl.formatMessage(messages.contributor) },
      { value: 'journalist', label: this.props.intl.formatMessage(messages.journalist) },
      { value: 'editor', label: this.props.intl.formatMessage(messages.editor) },
      { value: 'Annotator', label: this.props.intl.formatMessage(messages.annotator) },
    ];
    const errosList = (
      this.state.errors.map((error, index) => (
        <ListItem key={`email-error-${index.toString()}`} style={{ color: 'red' }} className="team-inivite-members__list-item-error">
          {this.renderError(error)}
        </ListItem>
      ))
    );
    let inviteBody = null;
    if (this.state.addMany) {
      inviteBody = (
        this.state.membersToInvite.map((member, index) => (
          <div key={`invite-team-memeber-new-${index.toString()}`}>
            <FlexRow>
              <span>{<FormattedMessage id="teamInviteMembers.inviteMembers" defaultMessage="Members will invited as " />}</span>
              <Select
                style={selectStyle}
                className="invite-member-email-role"
                onChange={e => this.handleRoleChange(e, index)}
                searchable={false}
                backspaceRemoves={false}
                clearable={false}
                options={roles}
                value={member.role}
              />
            </FlexRow>
            <TextField
              key="invite-member-email-input"
              id={index.toString()}
              className="invite-member-email-input"
              label={this.props.intl.formatMessage(messages.inviteEmailMultipleInput)}
              placeholder={this.props.intl.formatMessage(messages.inviteEmailMultipleInput)}
              multiline
              fullWidth
              margin="normal"
              variant="outlined"
              rows={4}
              onChange={e => this.handleEmailChange(e, index)}
              value={member.email}
            />
            {member.error.length === 0 ?
              null :
              <StyledHelper style={{ color: 'red' }}>
                {
                  member.error.map(errorItem => (
                    ` "${errorItem.email}": ${this.renderError(errorItem)}`
                  ))
                }
              </StyledHelper>}
          </div>
        ))
      );
    } else {
      inviteBody = (
        this.state.membersToInvite.map((member, index) => (
          <div key={`invite-team-memeber-new-${index.toString()}`}>
            <FlexRow>
              <TextField
                key="invite-member-email-input"
                className="invite-member-email-input"
                id={index.toString()}
                placeholder={this.props.intl.formatMessage(messages.inviteEmailInput)}
                onChange={e => this.handleEmailChange(e, index)}
                value={member.email}
                error={member.error.length > 0}
                margin="normal"
              />
              <StyledIconButton
                className="invite-member-email-remove-button"
                onClick={() => this.handleRemoveEmail(index)}
              >
                <MdCancel />
              </StyledIconButton>
              <Select
                style={selectStyle}
                className="invite-member-email-role"
                onChange={e => this.handleRoleChange(e, index)}
                searchable={false}
                backspaceRemoves={false}
                clearable={false}
                options={roles}
                value={member.role}
              />
            </FlexRow>
            {member.error.length === 0 ?
              null :
              <StyledHelper style={{ color: 'red' }}>
                {this.renderError(member.error[0])}
              </StyledHelper>}
          </div>
        ))
      );
    }

    return (
      <FlexRow>
        <RaisedButton
          style={{ marginLeft: 'auto', marginRight: units(1) }}
          onClick={this.handleOpenDialog.bind(this)}
          className="team-members__edit-button"
          label={
            <FormattedMessage id="teamInviteMembers.inviteMember" defaultMessage="Invite" />
          }
        />
        <Dialog
          className="team-invite-members__dialog"
          actionsContainerClassName="team-invite-members__action-container"
          open={this.state.dialogOpen}
          onClose={this.handleCloseDialog.bind(this)}
          scroll="paper"
          fullWidth
        >
          <DialogTitle>{this.props.intl.formatMessage(messages.inviteMembers)}</DialogTitle>
          <DialogContent>
            { errosList }
            <TextField
              id="invite-msg-input"
              className="team-invite-members__input"
              label={
                <FormattedMessage id="teamInviteMembers.customInvitation" defaultMessage="Add invitation note (optional)" />
              }
              fullWidth
              multiline
              rows={2}
              margin="normal"
              variant="outlined"
            />
            { inviteBody }
            { this.state.addMany ?
              null :
              <div style={{ height: units(12) }}>
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
              </div>
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
              keyboardFocused
            >
              <FormattedMessage id="teamInviteMembers.send" defaultMessage="Send" />
            </Button>
          </DialogActions>
        </Dialog>
      </FlexRow>
    );
  }
}

TeamInviteMembers.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};
export default injectIntl(TeamInviteMembers);
