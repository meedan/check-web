import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  avatarStyle,
  listItemStyle,
} from '../../../../config-styles';

class TeamMembershipRequestsListItem extends Component {
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
        leftAvatar={
          <Avatar
            style={avatarStyle}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <FlatButton
          onClick={this.handleRequest.bind(this, 'member')}
          className="team-member-requests__user-button team-member-requests__user-button--approve"
        >
          <FormattedMessage id="TeamMembershipRequestsListItem.approve" defaultMessage="Approve" />
        </FlatButton>
        <FlatButton
          onClick={this.handleRequest.bind(this, 'banned')}
          className="team-member-requests__user-button team-member-requests__user-button--deny"
        >
          <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Ignore" />
        </FlatButton>
      </ListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
