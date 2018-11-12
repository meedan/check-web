import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import ListItem from '@material-ui/core/ListItem';
import * as EmailValidator from 'email-validator';
import UserInvitationMutation from '../../relay/mutations/UserInvitationMutation';
import {
  units,
  selectStyle,
  Row,
  FlexRow,
} from '../../styles/js/shared';

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
    defaultMessage: 'Separate by comma',
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
});

class TeamInviteMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      membersToInvite: [{ email: '', role: 'contributor' }],
      errors: [],
      addMany: false,
    };
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      addMany: false,
      membersToInvite: [{ email: '', role: 'contributor' }],
    });
  }

  handleAddAnother() {
    this.setState({
      membersToInvite: [...this.state.membersToInvite, { email: '', role: 'contributor' }],
    });
  }

  handleAddMany() {
    this.setState({
      addMany: true,
      membersToInvite: [{ email: '', role: 'contributor' }],
    });
  }

  handleEmailChange(e, index) {
    this.state.membersToInvite[index].email = e.target.value;
    this.setState({ membersToInvite: this.state.membersToInvite });
  }

  handleRoleChange(e, index) {
    this.state.membersToInvite[index].role = e.value;
    this.setState({ membersToInvite: this.state.membersToInvite });
  }

  validateMembers(members) {
    const errors = [];
    const emptyEmails = members.every(obj => obj.email === '');
    if (emptyEmails === true) {
      errors.push({ key: 'empty' });
    } else {
      members.forEach((item) => {
        if (item.email !== '') {
          if (this.state.addMany) {
            const emails = item.email.split(',');
            emails.forEach((x) => {
              if (EmailValidator.validate(x) === false) {
                errors.push({ key: 'invalid', email: x });
              }
            });
          } else if (EmailValidator.validate(item.email) === false) {
            errors.push({ key: 'invalid', email: item.email });
          }
        }
      });
    }
    return errors;
  }

  handleSubmit() {
    const onFailure = () => {
    };

    const onSuccess = () => {
      this.setState({
        dialogOpen: false,
      });
    };
    const membersList = this.state.membersToInvite;
    const valitationErrors = this.validateMembers(membersList);
    if (valitationErrors.length > 0) {
      this.setState({ errors: valitationErrors });
      return;
    }
    if (valitationErrors.length === 0) {
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

  static renderError(item) {
    switch (item.key) {
    case 'invalid':
      return <FormattedMessage id="teamInviteMembers.invalidEmail" defaultMessage="{email} not a valis email address" values={{ email: item.email }} />;
    case 'empty':
      return <FormattedMessage id="teamInviteMembers.noEmail" defaultMessage="Should invite at least one eamil" />;
    default:
      return null;
    }
  }

  render() {
    const roles = [
      { value: 'contributor', label: this.props.intl.formatMessage(messages.contributor) },
      { value: 'journalist', label: this.props.intl.formatMessage(messages.journalist) },
      { value: 'editor', label: this.props.intl.formatMessage(messages.editor) },
    ];
    const actions = [
      <FlatButton
        label={<FormattedMessage id="teamInviteMembers.cancelAdd" defaultMessage="Cancel" />}
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        className="team-invite-members__dialog-submit-button"
        label={<FormattedMessage id="teamInviteMembers.send" defaultMessage="Send" />}
        primary
        keyboardFocused
        onClick={this.handleSubmit.bind(this)}
      />,
    ];

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
              multiLine
              fullWidth
              margin="normal"
              variant="outlined"
              rows={4}
              onChange={e => this.handleEmailChange(e, index)}
              value={member.email}
            />
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
              />
              <Select
                style={selectStyle}
                className="invimultilinete-member-email-role"
                onChange={e => this.handleRoleChange(e, index)}
                searchable={false}
                backspaceRemoves={false}
                clearable={false}
                options={roles}
                value={member.role}
              />
            </FlexRow>
          </div>
        ))
      );
    }

    return (
      <div>
        <RaisedButton
          style={{ marginLeft: 'auto', marginRight: units(2) }}
          onClick={this.handleOpenDialog.bind(this)}
          className="team-invite-member__invite-button"
          label={<FormattedMessage id="teamInviteMembers.inviteMember" defaultMessage="Invite" />}
        />
        <Dialog
          title={this.props.intl.formatMessage(messages.inviteMembers)}
          className="team-invite-members__dialog"
          actionsContainerClassName="team-invite-members__action-container"
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleCloseDialog.bind(this)}
          bodyStyle={{ minHeight: '200px' }}
          autoScrollBodyContent
        >
          {
            this.state.errors.map(error => (
              <ListItem className="team-inivite-members__list-item-error">{this.renderError(error).bind(this)}</ListItem>
            ))
          }
          <TextField
            id="invite-msg-input"
            className="team-invite-members__input"
            fullWidth
            floatingLabelText={
              <FormattedMessage id="teamInviteMembers.customInvitation" defaultMessage="Add invitation note (optional)" />
            }
            multiLine
            margin="normal"
            variant="outlined"
          />
          { inviteBody }
          { this.state.addMany ?
            null :
            <div style={{ height: units(10) }}>
              <Row>
                <FlatButton
                  className="team-invite-members__dialog-add-another-button"
                  label={<FormattedMessage id="teamInviteMembers.addAnother" defaultMessage="Add another" />}
                  onClick={this.handleAddAnother.bind(this)}
                />
                <FlatButton
                  className="team-invite-members__dialog-add-many-button"
                  label={<FormattedMessage id="teamInviteMembers.addMany" defaultMessage="Add many" />}
                  onClick={this.handleAddMany.bind(this)}
                />
              </Row>
            </div>
          }
        </Dialog>
      </div>
    );
  }
}

export default injectIntl(TeamInviteMembers);
