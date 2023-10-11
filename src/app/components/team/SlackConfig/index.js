import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import cx from 'classnames/bind';
import Alert from '../../cds/alerts-and-prompts/Alert';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import UserUtil from '../../user/UserUtil';
import SlackConfigDialog from './SlackConfigDialog';
import CheckContext from '../../../CheckContext';
import UpdateTeamMutation from '../../../relay/mutations/UpdateTeamMutation';
import { getErrorMessage } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import SettingsIcon from '../../../icons/settings.svg';
import SlackColorIcon from '../../../icons/slack_color.svg';
import styles from '../Integrations.module.css';
import settingsStyles from '../Settings.module.css';

const messages = defineMessages({
  unknownError: {
    id: 'global.unknownError',
    defaultMessage: 'Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists.',
    description: 'Message displayed in error notification when an operation fails unexpectedly',
    values: {
      supportEmail: stringHelper('SUPPORT_EMAIL'),
    },
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
      const fallbackMessage = this.props.intl.formatMessage(messages.unknownError);
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
      <div className={cx(settingsStyles['setting-content-container'], styles['integration-bot'])}>
        { this.state.message &&
          <Alert
            content={this.state.message}
            icon
            variant="error"
          />
        }
        <div className={settingsStyles['setting-content-container-title']}>
          <span>
            <SlackColorIcon />
            Slack
          </span>
          <div className={settingsStyles['setting-content-container-actions']}>
            <ButtonMain
              variant="text"
              size="default"
              theme="text"
              disabled={!enabled}
              onClick={this.handleOpenDialog.bind(this)}
              iconCenter={<SettingsIcon />}
              className="slack-config__settings"
            />
          </div>
        </div>
        <div className={styles['integration-bot-switch']}>
          <SwitchComponent
            className="slack-config__switch"
            checked={enabled}
            onChange={this.handleToggleSwitch}
            labelPlacement="end"
            label={
              <FormattedMessage
                id="slackConfig.text"
                defaultMessage="Send notifications to Slack channels"
                description="Description of the slack integration"
              />
            }
          />
        </div>
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
