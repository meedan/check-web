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
  Text,
  FlexRow,
} from '../../styles/js/variables';

class TeamMembershipRequestsListItem extends Component {
  handleRequest(event, status) {
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
        className="team-membership-requests__user"
        key={teamUser.node.id}
        disabled
      >
        <FlexRow>
          <FlexRow>
            <a href={profileLink(teamUser.node.user)}>
              <FlexRow>
                <Avatar
                  className="avatar"
                  src={teamUser.node.user.profile_image}
                  alt={teamUser.node.user.name}
                  style={{ position: 'static', marginRight: '16px' }}
                />
                <Text ellipsis>{teamUser.node.user.name}</Text>
              </FlexRow>
            </a>
          </FlexRow>
          <FlexRow>
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
          </FlexRow>
        </FlexRow>
      </ListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
