import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  buttonInButtonGroupStyle,
  avatarStyle,
  listItemWithButtonsStyle,
} from '../../styles/js/variables';

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
        disabled
        className="team-membership-requests__user"
        primaryText={teamUser.node.user.name}
        style={listItemWithButtonsStyle}
        leftAvatar={
          <Avatar
            style={Object.assign(avatarStyle, { top: 'initial', order: 1 })}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <div style={{ display: 'flex', order: '3' }}>
          <RaisedButton
            style={buttonInButtonGroupStyle}
            onClick={this.handleRequest.bind(this, 'member')}
            className="team-member-requests__user-button--approve"
            label={<FormattedMessage id="TeamMembershipRequestsListItem.approve" defaultMessage="Approve" />}
          />
          <RaisedButton
            onClick={this.handleRequest.bind(this, 'banned')}
            className="team-member-requests__user-button--deny"
            label={<FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Ignore" />}
          />
        </div>
      </ListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
