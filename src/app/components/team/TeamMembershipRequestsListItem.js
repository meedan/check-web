import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import FloatedDiv from '../layout/FloatedDiv';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  buttonInButtonGroupStyle,
  avatarStyle,
  listItemStyle,
  toDirection,
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
        disabled
        style={listItemStyle}
        className="team-membership-requests__user"
        primaryText={teamUser.node.user.name}
        secondaryText={<FormattedMessage
          id="teamMembershipRequests.requestsToJoin"
          defaultMessage={'Requests to join'}
        />}
        leftAvatar={
          <Avatar
            style={avatarStyle}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <FloatedDiv direction="to">
          <RaisedButton
            style={buttonInButtonGroupStyle}
            onClick={this.handleRequest.bind(this, 'member')}
            className="team-member-requests__user-button team-member-requests__user-button--approve"
          >
            <FormattedMessage id="TeamMembershipRequestsListItem.approve" defaultMessage="Approve" />
          </RaisedButton>
          <RaisedButton
            onClick={this.handleRequest.bind(this, 'banned')}
            className="team-member-requests__user-button team-member-requests__user-button--deny"
          >
            <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Ignore" />
          </RaisedButton>
        </FloatedDiv>
      </ListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
