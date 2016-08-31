import React, { Component } from 'react';
import Relay from 'react-relay';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import DeleteTeamUserMutation from '../../relay/DeleteTeamUserMutation';

class TeamMembershipRequestsCell extends Component {
  handleDeleteRequest(e) {
     e.preventDefault();
     var that = this

     var onFailure = (transaction) => {
       transaction.getError().json().then(function(json) {
       });

       this.setState({isEditingNameAndDescription: false});
    };
    var onSuccess = (response) => {
    };

    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
       team_id: this.props.team_user.node.team_id,
       user_id: this.props.team_user.node.user_id,
       id: this.props.team_user.node.id,
       status: "banned"
     }),
     { onSuccess, onFailure }
   );
  }

  handleApproveRequest(e) {
     e.preventDefault();
     var that = this

     var onFailure = (transaction) => {
       transaction.getError().json().then(function(json) {
       });

       this.setState({isEditingNameAndDescription: false});
    };
    var onSuccess = (response) => {
    };

    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
       team_id: this.props.team_user.node.team_id,
       user_id: this.props.team_user.node.user_id,
       id: this.props.team_user.node.id,
       status: "member"
     }),
     { onSuccess, onFailure }
   );
 }


  render() {
    const team_user = this.props.team_user

    return (
      <li className='team-membership-requests__user'>
        <img src={team_user.node.user.profile_image} className='team-membership-requests__user-avatar' />
        <div className='team-membership-requests__user-details'>
          <h3 className='team-membership-requests__user-name'>{team_user.node.user.name}</h3>
          <span className='team-membership-requests__user-username'>({team_user.node.user.name})</span>
        </div>
        <button onClick={this.handleApproveRequest.bind(this)} className='team-member-requests__user-button team-member-requests__user-button--approve '>Approve</button>
        <button onClick={this.handleDeleteRequest.bind(this)} className='team-member-requests__user-button team-member-requests__user-button--deny'>Ignore</button>
      </li>
    );
  }
}

export default TeamMembershipRequestsCell;
