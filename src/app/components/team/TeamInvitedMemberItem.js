import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { ListItem } from 'material-ui/List';
import Button from '@material-ui/core/Button';
import '../../styles/css/tooltip.css';
import ResendCancelInvitationMutation from '../../relay/mutations/ResendCancelInvitationMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import {
  FlexRow,
  Text,
  units,
} from '../../styles/js/shared';

class TeamInvitedMemberItem extends Component {
  handleTeamMemberInvites(action) {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.context.setMessage(message);
    };

    const onSuccess = () => {
      if (action === 'resend') {
        const message = (
          <FormattedMessage
            id="teamInviteMembers.resendEmailSuccess"
            defaultMessage="Invitation was sent successfully"
          />
        );
        this.context.setMessage(message);
      }
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
          <Button
            variant="contained"
            style={{ marginLeft: 'auto', marginRight: units(1) }}
            onClick={this.handleTeamMemberInvites.bind(this, 'cancel')}
            className="team-member-invited__user-button--cancel"
          >
            <FormattedMessage
              id="TeamMembersInvitedListItem.cancel"
              defaultMessage="Cancel invite"
            />
          </Button>
          <Button
            variant="contained"
            onClick={this.handleTeamMemberInvites.bind(this, 'resend')}
            className="team-member-invited__user-button--resend"
          >
            <FormattedMessage id="TeamMembersInvitedListItem.resend" defaultMessage="Resend" />
          </Button>
        </FlexRow>
      </ListItem>
    );
  }
}

TeamInvitedMemberItem.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};
export default injectIntl(TeamInvitedMemberItem);
