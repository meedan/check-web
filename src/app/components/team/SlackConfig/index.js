import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import SettingsIcon from '@material-ui/icons/Settings';
import styled from 'styled-components';
import UserUtil from '../../user/UserUtil';
import Message from '../../Message';
import SlackConfigDialog from './SlackConfigDialog';
import CheckContext from '../../../CheckContext';
import UpdateTeamMutation from '../../../relay/mutations/UpdateTeamMutation';
import globalStrings from '../../../globalStrings';
import { getErrorMessage } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import {
  title1,
} from '../../../styles/js/shared';

class SlackConfig extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openDialog: false,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  }

  handleOpenDialog = () => {
    this.setState({
      openDialog: true,
    });
  }

  handleToggleSwitch = () => {
    const enabled = typeof this.state.enabled !== 'undefined' && this.state.enabled !== null
      ? this.state.enabled
      : Boolean(parseInt(this.props.team.get_slack_notifications_enabled, 10));

    this.setState({ enabled: !enabled }, this.handleSubmit);
  }

  handleSubmit() {
    const enabled = typeof this.state.enabled !== 'undefined' && this.state.enabled !== null
      ? this.state.enabled
      : Boolean(parseInt(this.props.team.get_slack_notifications_enabled, 10));

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      return this.setState({ message });
    };

    const onSuccess = () => {
      this.handleCloseDialog();
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        slack_notifications_enabled: enabled ? '1' : '0',
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { team } = this.props;
    const enabled = typeof this.state.enabled !== 'undefined' && this.state.enabled !== null
      ? this.state.enabled
      : Boolean(parseInt(this.props.team.get_slack_notifications_enabled, 10));

    const StyledCardHeader = styled(CardHeader)`
      span {
        font: ${title1} !important;
      }
    `;

    if (UserUtil.myRole(this.getCurrentUser(), team.slug) !== 'admin') {
      return null;
    }

    return (
      <div>
        <Card>
          <StyledCardHeader
            avatar={
              <img src="/images/slack.svg" height="32" width="32" alt="Slack" />
            }
            title={
              <span>Slack</span>
            }
            action={
              <IconButton
                className="slack-config__settings"
                onClick={this.handleOpenDialog.bind(this)}
                disabled={!enabled}
              >
                <SettingsIcon />
              </IconButton>
            }
          />
          <Message message={this.state.message} />
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <FormattedMessage
                id="slackConfig.text"
                defaultMessage="Send notifications to Slack channels when items are added to specific lists"
              />
              <Switch
                className="slack-config__switch"
                checked={enabled}
                onClick={this.handleToggleSwitch}
              />
            </Box>
          </CardContent>
        </Card>
        <Dialog
          open={this.state.openDialog}
          onClose={this.handleCloseDialog}
          maxWidth="lg"
        >
          <SlackConfigDialog teamSlug={this.props.team.slug} onCancel={this.handleCloseDialog} />
        </Dialog>
      </div>
    );
  }
}

SlackConfig.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(SlackConfig);
