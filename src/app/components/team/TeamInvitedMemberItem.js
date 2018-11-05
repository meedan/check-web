import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import 'react-select/dist/react-select.css';
import { ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import '../../styles/css/tooltip.css';
import ResendCancelInvitationMutation from '../../relay/mutations/ResendCancelInvitationMutation';
import {
  FlexRow,
  Text,
  buttonInButtonGroupStyle,
} from '../../styles/js/shared';

class TeamInvitedMemberItem extends Component {
  handleTeamMemberInvites(action) {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
    };

    Relay.Store.commitUpdate(
      new ResendCancelInvitationMutation({
        email: this.props.invitedMail,
        action,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    return (
      <ListItem
        className="team-members__invited"
        key={this.props.invitedMail}
        disabled
      >
        <FlexRow>
          <Text ellipsis>
            {this.props.invitedMail}
          </Text>
          <RaisedButton
            style={buttonInButtonGroupStyle}
            onClick={this.handleTeamMemberInvites.bind(this, 'cancel')}
            className="team-member-invited__user-button--cancel"
            label={
              <FormattedMessage
                id="TeamMembersInvitedListItem.cancel"
                defaultMessage="Cancel Invite"
              />
            }
          />
          <RaisedButton
            style={buttonInButtonGroupStyle}
            onClick={this.handleTeamMemberInvites.bind(this, 'resend')}
            className="team-member-invited__user-button--resend"
            label={
              <FormattedMessage id="TeamMembersInvitedListItem.resend" defaultMessage="Resend" />
            }
          />
        </FlexRow>
      </ListItem>
    );
  }
}

export default injectIntl(TeamInvitedMemberItem);
