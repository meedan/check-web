import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import styled from 'styled-components';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  buttonInButtonGroupStyle,
  avatarStyle,
} from '../../styles/js/variables';

const StyledMuiListItem = styled(ListItem)`
  > div > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .button-group {
      display: flex;
      order: 3;
    }
  }
`;

class TeamMembershipRequestsListItem extends Component {
  handleRequest(status) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        status,
      }),
    );
  }

  profileLink(user) {
    if (
      user &&
      user.source &&
      user.source.accounts &&
      user.source.accounts.edges &&
      user.source.accounts.edges.length > 0
    ) {
      return user.source.accounts.edges[0].node.url;
    }
    return null;
  }

  render() {
    const teamUser = this.props.teamUser;
    return (
      <StyledMuiListItem
        className="team-membership-requests__user"
        primaryText={teamUser.node.user.name}
        leftAvatar={
          <Avatar
            style={Object.assign(avatarStyle, { top: 'initial', order: 1 })}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <div className="button-group">
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
      </StyledMuiListItem>
    );
  }
}

export default TeamMembershipRequestsListItem;
