import React, { Component } from 'react';
import Relay from 'react-relay';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class TeamMembersCell extends Component {
  handleDeleteTeamUser(e) {
    e.preventDefault();

    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.team_user.node.id,
        status: 'banned'
      })
    );
  }

  handleRoleChange(val) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.team_user.node.id,
        role: val
      })
    );
  }

  render() {
    const team_user = this.props.team_user;
    var isEditing = this.props.isEditing;

    const roles = [
      { value: 'contributor', label: 'Contributor' },
      { value: 'journalist',  label: 'Journalist' },
      { value: 'editor',      label: 'Editor' },
      { value: 'owner',       label: 'Owner' }
    ];

    return (
      <li className='team-members__member'>
        <img src={team_user.node.user.profile_image} className='team-members__member-avatar' />
        <div className='team-members__member-details'>
          <h3 className='team-members__member-name'>{team_user.node.user.name}</h3>
          <span className='team-members__member-username'>({team_user.node.user.name})</span>
        </div>

        <Select className='team-members__member-role' onChange={this.handleRoleChange.bind(this)} autosize={true} searchable={false} backspaceRemoves={false} clearable={false} disabled={!isEditing || team_user.node.status === 'banned'} options={roles} value={team_user.node.role} />
        { (isEditing && team_user.node.status != 'banned') ? (<button onClick={this.handleDeleteTeamUser.bind(this)} className='team-members__delete-member'><span className='team-members__delete-member-icon'>×</span></button>) : null }
      </li>
    );
  }
}

export default TeamMembersCell;
