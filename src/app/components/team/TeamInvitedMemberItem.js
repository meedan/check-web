import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl } from "react-intl";
import Relay from "react-relay/classic";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import "../../styles/css/tooltip.css";
import ResendCancelInvitationMutation from "../../relay/mutations/ResendCancelInvitationMutation";
import { getErrorMessage } from "../../helpers";
import { stringHelper } from "../../customHelpers";
import { withSetFlashMessage } from "../FlashMessage";
import globalStrings from "../../globalStrings";
import { AlignOpposite, FlexRow, Text, units } from "../../styles/js/shared";

class TeamInvitedMemberItem extends Component {
  handleTeamMemberInvites(action) {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(
        globalStrings.unknownError,
        { supportEmail: stringHelper("SUPPORT_EMAIL") }
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
    };

    const onSuccess = () => {
      if (action === "resend") {
        const message = (
          <FormattedMessage
            id="teamInviteMembers.resendEmailSuccess"
            defaultMessage="Invitation was sent successfully"
          />
        );
        this.props.setFlashMessage(message);
      }
    };

    Relay.Store.commitUpdate(
      new ResendCancelInvitationMutation({
        email: this.props.invitedMail,
        action,
      }),
      { onSuccess, onFailure }
    );
  }

  render() {
    return (
      <ListItem
        className="team-members__invited-list-item"
        key={this.props.invitedMail}
      >
        <Text ellipsis>{this.props.invitedMail}</Text>
        <AlignOpposite>
          <FlexRow>
            <Box ml={"auto"} mr={`${units(1)}`}>
              <Button
                variant="contained"
                onClick={this.handleTeamMemberInvites.bind(this, "cancel")}
                className="team-member-invited__user-button--cancel"
              >
                <FormattedMessage
                  id="TeamMembersInvitedListItem.cancel"
                  defaultMessage="Cancel invite"
                />
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={this.handleTeamMemberInvites.bind(this, "resend")}
              className="team-member-invited__user-button--resend"
            >
              <FormattedMessage
                id="TeamMembersInvitedListItem.resend"
                defaultMessage="Resend"
              />
            </Button>
          </FlexRow>
        </AlignOpposite>
      </ListItem>
    );
  }
}

TeamInvitedMemberItem.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

TeamInvitedMemberItem.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(injectIntl(TeamInvitedMemberItem));
