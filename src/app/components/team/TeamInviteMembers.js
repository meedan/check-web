import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Select from 'react-select';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import UserInvitationMutation from '../../relay/mutations/UserInvitationMutation';
import {
  units,
  selectStyle,
  Row,
} from '../../styles/js/shared';

const messages = defineMessages({
  inviteMembers: {
    id: 'TeamInviteMembers.newInvite',
    defaultMessage: 'Invite Members',
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
  owner: {
    id: 'TeamMembersListItem.owner',
    defaultMessage: 'Owner',
  },
});

class TeamInviteMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      submitDisabled: true,
      membersToInvite: [{ email: '', role: '' }],
      addMany: false,
    };
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      submitDisabled: false,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      addMany: false,
      membersToInvite: [{ email: '', role: '' }],
    });
  }

  handleAddAnother() {
    this.setState({
      membersToInvite: [...this.state.membersToInvite, { email: '', role: '' }],
    });
  }

  handleAddMany() {
    this.setState({
      addMany: true,
      membersToInvite: [{ email: '', role: '' }],
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

  handleSubmit() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
      this.setState({
        dialogOpen: false,
      });
    };

    if (!this.state.submitDisabled) {
      const invitation = document.getElementById('invite-msg-input').value.trim();
      const members = JSON.stringify(this.state.membersToInvite);
      Relay.Store.commitUpdate(
        new UserInvitationMutation({
          invitation,
          members,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
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
        disabled={this.state.submitDisabled}
      />,
    ];

    let inviteBody = null;
    if (this.state.addMany) {
      inviteBody = (
        this.state.membersToInvite.map((member, index) => (
          <div key={`invite-team-memeber-new-${index.toString()}`}>
            <Row>
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
            </Row>
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
            <Row>
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
            </Row>
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
          scroll="paper"
          open={this.state.dialogOpen}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <TextField
            id="invite-msg-input"
            className="team-invite-members__input"
            fullWidth
            floatingLabelText={
              <FormattedMessage id="teamInviteMembers.customInvitation" defaultMessage="Add custom invitation (optional)" />
            }
            multiLine
            margin="normal"
            variant="outlined"
          />
          { inviteBody }
          { this.state.addMany ?
            null :
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
          }
        </Dialog>
      </div>
    );
  }
}

export default injectIntl(TeamInviteMembers);
