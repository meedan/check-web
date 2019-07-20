import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Dialog from 'material-ui/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import styled from 'styled-components';
import UserUtil from '../user/UserUtil';
import Message from '../Message';
import CheckContext from '../../CheckContext';
// import FaceFrown from '../../../assets/images/feedback/face-frown';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import globalStrings from '../../globalStrings';
import { safelyParseJSON } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import {
  title1,
} from '../../styles/js/shared';

const messages = defineMessages({
  title: {
    id: 'slackConfig.title',
    defaultMessage: 'Slack integration',
  },
  menuTooltip: {
    id: 'slackConfig.menuTooltip',
    defaultMessage: 'Configure integration',
  },
});

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

  handleChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  }

  handleOpenDialog = () => {
    this.setState({
      openDialog: true,
      channel: null,
      webhook: null,
      message: null,
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

    const channel = typeof this.state.channel !== 'undefined' && this.state.channel !== null
      ? this.state.channel
      : this.props.team.get_slack_channel;

    const webhook = typeof this.state.webhook !== 'undefined' && this.state.webhook !== null
      ? this.state.webhook
      : this.props.team.get_slack_webhook;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(
        globalStrings.unknownError,
        { supportEmail: stringHelper('SUPPORT_EMAIL') },
      );
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      return this.setState({ message });
    };

    const onSuccess = () => {
      this.handleCloseDialog();
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        slack_notifications_enabled: enabled ? '1' : '0',
        slack_webhook: webhook,
        slack_channel: channel,
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

    if (UserUtil.myRole(this.getCurrentUser(), team.slug) !== 'owner') {
      return null;
    }

    return (
      <div>
        <Card>
          <StyledCardHeader
            title={
              <span>
                {/* Todo: Slack Icon <FaceFrown /> */}
                <FormattedMessage
                  id="slackConfig.title"
                  defaultMessage="Slack integration"
                />
              </span>
            }
            action={
              <Tooltip title={this.props.intl.formatMessage(messages.menuTooltip)}>
                <IconButton
                  onClick={this.handleOpenDialog.bind(this)}
                >
                  <IconMoreHoriz />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            <FormattedMessage
              id="slackConfig.text"
              defaultMessage="Notify a Slack channel every time someone adds to one of your projects."
            />
            <Switch
              checked={enabled}
              onClick={this.handleToggleSwitch}
            />
          </CardContent>
        </Card>
        <Dialog
          open={this.state.openDialog}
          onRequestClose={this.handleCloseDialog}
          title={this.props.intl.formatMessage(messages.title)}
        >
          <Message message={this.state.message} />
          <FormattedMessage
            id="slackConfig.text"
            defaultMessage="Notify a Slack channel every time someone adds to one of your projects."
          />
          <TextField
            className="team__slack-webhook-input"
            label="Slack webhook"
            name="webhook"
            defaultValue={team.get_slack_webhook}
            onChange={this.handleChange.bind(this)}
            margin="normal"
            fullWidth
          />
          <TextField
            className="team__slack-channel-input"
            label="Slack default #channel"
            name="channel"
            defaultValue={team.get_slack_channel}
            onChange={this.handleChange.bind(this)}
            margin="normal"
            fullWidth
          />
          <span>
            <Button onClick={this.handleCloseDialog}>
              {this.props.intl.formatMessage(globalStrings.cancel)}
            </Button>
            <Button color="primary" onClick={this.handleSubmit.bind(this)}>
              {this.props.intl.formatMessage(globalStrings.save)}
            </Button>
          </span>
        </Dialog>
      </div>
    );
  }
}

SlackConfig.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(SlackConfig);
