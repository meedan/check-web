import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import UserUtil from '../../user/UserUtil';
import Message from '../../Message';
import SlackConfigDialog from './SlackConfigDialog';
import CheckContext from '../../../CheckContext';
import UpdateTeamMutation from '../../../relay/mutations/UpdateTeamMutation';
import globalStrings from '../../../globalStrings';
import { getErrorMessage } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import SettingsIcon from '../../../icons/settings.svg';
import SlackColorIcon from '../../../icons/slack_color.svg';

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

    if (UserUtil.myRole(this.getCurrentUser(), team.slug) !== 'admin') {
      return null;
    }

    return (
      <div>
        <Card>
          <CardHeader
            avatar={
              <SlackColorIcon style={{ fontSize: '32px' }} />
            }
            title={
              <span className="typography-h6">Slack</span>
            }
            action={
              <ButtonMain
                variant="text"
                size="default"
                theme="text"
                disabled={!enabled}
                onClick={this.handleOpenDialog.bind(this)}
                iconCenter={<SettingsIcon />}
                buttonProps={{
                  className: 'slack-config__settings',
                }}
              />
            }
          />
          <Message message={this.state.message} />
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <FormattedMessage
                id="slackConfig.text"
                defaultMessage="Send notifications to Slack channels"
                description="Description of the slack integration"
              />
              <SwitchComponent
                className="slack-config__switch"
                checked={enabled}
                onChange={this.handleToggleSwitch}
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

SlackConfig.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_slack_notifications_enabled: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export { SlackConfig };

export default createFragmentContainer(injectIntl(SlackConfig), graphql`
  fragment SlackConfig_team on Team {
    id
    slug
    get_slack_notifications_enabled
  }
`);
