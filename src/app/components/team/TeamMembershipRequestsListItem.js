import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import { ListItem } from 'material-ui/List';
import { profileLink } from './TeamUtil';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  buttonInButtonGroupStyle,
  highlightBlue,
  MemberRow,
  Text,
  checkBlue,
} from '../../styles/js/variables';

class TeamMembershipRequestsListItem extends Component {
  handleRequest(status) {
    // Todo: stop propagation here; prevent going to the href of the parent element — CGB 2017-7-3
    event.stopPropagation();
    alert("Approval is temporarily disabled while I'm trying to prevent going to the profile page (href on the parent element) ...");
    // Relay.Store.commitUpdate(
    //   new UpdateTeamUserMutation({
    //     id: this.props.teamUser.node.id,
    //     status,
    //   }),
    // );
  }

  render() {
    const teamUser = this.props.teamUser;

    return (
      <ListItem
        className="team-membership-requests__user"
        key={teamUser.node.id}
        // Disabled while debugging stop propagation
        // href={profileLink(teamUser.node.user)}
      >
        <MemberRow>
          <div>
            <Avatar
              className="avatar"
              src={teamUser.node.user.profile_image}
              alt={teamUser.node.user.name}
              style={{ position: 'static' }}
            />
            <Text ellipsis>{teamUser.node.user.name}</Text>
          </div>
          <div>
            <RaisedButton
              style={buttonInButtonGroupStyle}
              onClick={this.handleRequest.bind(this, 'member')}
              className="team-member-requests__user-button--approve"
              label={
                <FormattedMessage
                  id="TeamMembershipRequestsListItem.approve"
                  defaultMessage="Approve"
                />
              }
            />
            <RaisedButton
              onClick={this.handleRequest.bind(this, 'banned')}
              className="team-member-requests__user-button--deny"
              label={
                <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Ignore" />
              }
            />
          </div>
        </MemberRow>
      </ListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
