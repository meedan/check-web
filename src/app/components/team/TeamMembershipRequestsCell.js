import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';

class TeamMembershipRequestsCell extends Component {
  handleRequest(status) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        status,
      }),
    );
  }

  render() {
    const teamUser = this.props.teamUser;

    return (
      <li className="team-membership-requests__user">
        <img alt={teamUser.node.user.name} src={teamUser.node.user.profile_image} className="team-membership-requests__user-avatar" />
        <div className="team-membership-requests__user-details">
          <h3 className="team-membership-requests__user-name">{teamUser.node.user.name}</h3>
          <span className="team-membership-requests__user-username">({teamUser.node.user.name})</span>
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
