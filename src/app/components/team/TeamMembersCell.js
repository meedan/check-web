import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const messages = defineMessages({
  contributor: {
    id: 'teamMembersCell.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'teamMembersCell.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'teamMembersCell.editor',
    defaultMessage: 'Editor',
  },
  owner: {
    id: 'teamMembersCell.owner',
    defaultMessage: 'Owner',
  },
});

class TeamMembersCell extends Component {
  handleDeleteTeamUser(e) {
    e.preventDefault();

    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        status: 'banned',
      }),
    );
  }

  handleRoleChange(val) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        role: val,
      }),
    );
  }

  render() {
    const teamUser = this.props.teamUser;
    const isEditing = this.props.isEditing;

    const roles = [
      { value: 'contributor', label: this.props.intl.formatMessage(messages.contributor) },
      { value: 'journalist', label: this.props.intl.formatMessage(messages.journalist) },
      { value: 'editor', label: this.props.intl.formatMessage(messages.editor) },
      { value: 'owner', label: this.props.intl.formatMessage(messages.owner) },
    ];

    return (
      <li className="team-members__member">
        <img src={teamUser.node.user.profile_image} className="team-members__member-avatar" />
        <div className="team-members__member-details">
          <h3 className="team-members__member-name">{teamUser.node.user.name}</h3>
          <span className="team-members__member-username">({teamUser.node.user.name})</span>
        </div>

        <Select className="team-members__member-role" onChange={this.handleRoleChange.bind(this)} autosize searchable={false} backspaceRemoves={false} clearable={false} disabled={!isEditing || teamUser.node.status === 'banned'} options={roles} value={teamUser.node.role} />
        { (isEditing && teamUser.node.status != 'banned') ? (<button onClick={this.handleDeleteTeamUser.bind(this)} className="team-members__delete-member"><span className="team-members__delete-member-icon">×</span></button>) : null }
      </li>
    );
  }
}

TeamMembersCell.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersCell);
