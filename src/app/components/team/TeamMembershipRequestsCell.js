import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  avatarStyle,
  listItemStyle,
  listItemButtonStyle,
} from '../../../../config-styles';

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
      <ListItem
        style={listItemStyle}
        className="team-membership-requests__user"
        primaryText={teamUser.node.user.name}
        rightIconButton={
          <div style={listItemButtonStyle}>
            <FlatButton
              onClick={this.handleRequest.bind(this, 'member')}
              className="team-member-requests__user-button team-member-requests__user-button--approve"
            >
              <FormattedMessage id="teamMembershipRequestsCell.approve" defaultMessage="Approve" />
            </FlatButton>
            <FlatButton
              onClick={this.handleRequest.bind(this, 'banned')}
              className="team-member-requests__user-button team-member-requests__user-button--deny"
            >
              <FormattedMessage id="teamMembershipRequestsCell.deny" defaultMessage="Ignore" />
            </FlatButton>
          </div>
        }
        leftAvatar={
          <Avatar
            style={avatarStyle}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      />
    );
  }
}

export default TeamMembershipRequestsCell;
