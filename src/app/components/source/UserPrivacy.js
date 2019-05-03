import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Card, CardText } from 'material-ui/Card';
import rtlDetect from 'rtl-detect';
import FlatButton from 'material-ui/FlatButton';
import { List } from 'material-ui/List';
import Switch from '@material-ui/core/Switch';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserConnectedAccount from '../user/UserConnectedAccount';
import { logout } from '../../redux/actions';
import DeleteCheckUserMutation from '../../relay/mutations/DeleteCheckUserMutation';
import SetUserSecuritySettingsMutation from '../../relay/mutations/SetUserSecuritySettingsMutation';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { units } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const messages = defineMessages({
  deleteAccount: {
    id: 'UserPrivacy.deleteAccount',
    defaultMessage: 'Delete Account',
  },
});

class UserPrivacy extends Component {
  static handleSubmit(subject) {
    const email = 'privacy@meedan.com';
    window.location.href = `mailto:${email}?subject=${subject}`;
  }

  constructor(props) {
    super(props);
    let sendSuccessfulLogin = props.user.get_send_successful_login_notifications;
    if (props.user.get_send_successful_login_notifications == null) {
      sendSuccessfulLogin = true;
    }
    let sendFailedLogin = props.user.get_send_failed_login_notifications;
    if (props.user.get_send_failed_login_notifications == null) {
      sendFailedLogin = true;
    }
    this.state = {
      dialogOpen: false,
      message: null,
      sendSuccessfulLogin,
      sendFailedLogin,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleOpenDialog() {
    this.setState({ dialogOpen: true });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleDeleteAccount() {
    this.handleRequestDeleteAccount();
    this.handleCloseDialog();
  }

  handleError(json) {
    let message = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message });
  }

  handleRequestDeleteAccount() {
    const { user } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
      logout();
    };

    Relay.Store.commitUpdate(
      new DeleteCheckUserMutation({
        id: user.dbid,
      }),
      { onSuccess, onFailure },
    );
  }

  handleSecuritySettings(type, e, inputChecked) {
    const { id } = this.props.user;

    const onFailure = () => {
    };
    const onSuccess = () => {
    };
    let { sendSuccessfulLogin, sendFailedLogin } = this.state;
    if (type === 'successfulLogin') {
      sendSuccessfulLogin = inputChecked;
    } else {
      sendFailedLogin = inputChecked;
    }
    this.setState({
      sendSuccessfulLogin,
      sendFailedLogin,
    });
    Relay.Store.commitUpdate(
      new SetUserSecuritySettingsMutation({
        id,
        sendSuccessfulLogin,
        sendFailedLogin,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { user } = this.props;
    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

    const linkStyle = {
      textDecoration: 'underline',
    };

    const style = {
      margin: `${units(2)} 0`,
    };

    const cardStyle = {
      margin: `${units(2)} 0`,
    };

    const cardTextStyle = {
      display: 'flex',
      alignItems: 'center',
    };

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const buttonStyle = {
      minWidth: 300,
      textAlign: direction.to,
    };

    const confirmDialog = {
      blurb: <FormattedMessage
        id="userPrivacy.deleteAccountConfirmationText"
        defaultMessage="Are you sure? This will remove your account and log you out of the app."
      />,
    };

    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');
    // TODO: Read loginTrail from config
    const loginTrial = 4;

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userPrivacy.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    const { providers } = this.props.user;
    providers.splice(providers.indexOf('google_oauth2'), 1);

    return (
      <div id="user__privacy">
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" />
        </h2>
        <p style={style}>
          <FormattedMessage
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            values={{
              ppLink,
              appName,
            }}
          />
        </p>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.seeInformationText"
              defaultMessage="We will send you a file with the content and data you created and generated on {appName}. This can be kept for your records or transferred to another service."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__see-info"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Send information')}
            />
          </CardText>
        </Card>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__stop-processing"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Stop processing')}
            />
          </CardText>
        </Card>
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.connectedAccounts" defaultMessage="Connected accounts" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <List>
              { providers.map(provider => (
                <UserConnectedAccount
                  provider={provider}
                  user={user}
                  key={provider.key}
                />
              ))}
            </List>
          </CardText>
        </Card>
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.security" defaultMessage="Security" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <span style={{ minWidth: '500px', padding: '0px' }}>
              <FormattedMessage
                id="userPrivacy.successfulLoginText"
                defaultMessage="Receive a notification for every login"
              />
            </span>
            <Switch
              id="edit-security__successfull-login-switch"
              checked={Boolean(this.state.sendSuccessfulLogin)}
              onChange={this.handleSecuritySettings.bind(this, 'successfulLogin')}
              color="primary"
            />
          </CardText>
          <CardText style={cardTextStyle}>
            <span style={{ minWidth: '500px', padding: '0px' }}>
              <FormattedMessage
                id="userPrivacy.failedfulLoginText"
                defaultMessage="Receive a notification for {loginTrial} consecutive failed login attempts"
                values={{ loginTrial }}
                style={{ minWidth: '500px', padding: '0px' }}
              />
            </span>
            <Switch
              id="edit-security__failed-login-switch"
              checked={Boolean(this.state.sendFailedLogin)}
              onChange={this.handleSecuritySettings.bind(this, 'failedLogin')}
              color="primary"
            />
          </CardText>
        </Card>
        <h2 style={Object.assign({}, style, { marginTop: units(6) })}>
          <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.deleteAccountText"
              defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and team activity will become pseudonymous and remain on {appName}."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__delete-account"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" />}
              primary
              onClick={this.handleOpenDialog.bind(this)}
            />
            <ConfirmDialog
              message={this.state.message}
              open={this.state.dialogOpen}
              title={this.props.intl.formatMessage(messages.deleteAccount)}
              blurb={confirmDialog.blurb}
              handleClose={this.handleCloseDialog.bind(this)}
              handleConfirm={this.handleDeleteAccount.bind(this)}
            />
          </CardText>
        </Card>
      </div>
    );
  }
}

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPrivacy);
