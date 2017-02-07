import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';

class TeamMembershipRequestsCell extends Component {
  handleRequest(status) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.team_user.node.id,
        status,
      }),
    );
  }

  render() {
    const team_user = this.props.team_user;

    return (
      <li className="team-membership-requests__user">
        <img src={team_user.node.user.profile_image} className="team-membership-requests__user-avatar" />
        <div className="team-membership-requests__user-details">
          <h3 className="team-membership-requests__user-name">{team_user.node.user.name}</h3>
          <span className="team-membership-requests__user-username">({team_user.node.user.name})</span>
        </div>
        <button onClick={this.handleRequest.bind(this, 'member')} className="team-member-requests__user-button team-member-requests__user-button--approve">
          <FormattedMessage id="teamMembershipRequestsCell.approve" defaultMessage="Approve" />
        </button>
        <button onClick={this.handleRequest.bind(this, 'banned')} className="team-member-requests__user-button team-member-requests__user-button--deny">
          <FormattedMessage id="teamMembershipRequestsCell.deny" defaultMessage="Ignore" />
        </button>
      </li>
    );
  }
}

export default TeamMembershipRequestsCell;
