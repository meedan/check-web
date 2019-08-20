import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Card, CardText } from 'material-ui/Card';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import ChangePasswordComponent from '../ChangePasswordComponent';
import SetUserSecuritySettingsMutation from '../../relay/mutations/SetUserSecuritySettingsMutation';
import GenerateTwoFactorBackupCodesMutation from '../../relay/mutations/GenerateTwoFactorBackupCodesMutation';
import UserTwoFactorAuthenticationMutation from '../../relay/mutations/UserTwoFactorAuthenticationMutation';
import ChangePasswordMutation from '../../relay/mutations/ChangePasswordMutation';
import { logout } from '../../redux/actions';
import CheckContext from '../../CheckContext';
import { safelyParseJSON } from '../../helpers';
import { units, opaqueBlack10 } from '../../styles/js/shared';

const messages = defineMessages({
  passwordInput: {
    id: 'UserSecurity.passwordInput',
    defaultMessage: 'Current Password',
  },
  passwordError: {
    id: 'UserSecurity.passwordError',
    defaultMessage: 'Incorrect password',
  },
  verifyInput: {
    id: 'UserSecurity.verifyInput',
    defaultMessage: 'Validation Code',
  },
  verifyError: {
    id: 'UserSecurity.verifyError',
    defaultMessage: 'Incorrect validation code',
  },
});

class UserSecurity extends Component {
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
      twoFactorAuthentication: props.user.two_factor.otp_required,
      showFactorAuthForm: false,
      sendSuccessfulLogin,
      sendFailedLogin,
      showFactorCommonFields: props.user.two_factor.otp_required,
      password: '',
      qrcode: '',
      backupCodes: [],
      errors: { password: true, qrcode: true },
      new_password: '',
      password_confirmation: '',
      current_password: '',
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  handleTwoFactorAuthenticationForm(e, inputChecked) {
    const showFactorCommonFields = this.state.twoFactorAuthentication || inputChecked;
    this.setState({
      showFactorAuthForm: inputChecked,
      showFactorCommonFields,
    });
  }

  validateInputs() {
    const errors = { password: true, qrcode: true };
    errors.password = this.state.password.length > 0;
    let isValid = errors.password;
    if (this.state.twoFactorAuthentication === false) {
      errors.qrcode = this.state.qrcode.length > 0;
      isValid = isValid && this.state.qrcode.length > 0;
    }
    this.setState({ errors });
    return isValid;
  }

  handleSubmitTwoFactorAuthentication(enabled) {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      const json = safelyParseJSON(error.source);
      if (json && json.errors) {
        const defaultErrors = { password: true, qrcode: true };
        const returnErrors = safelyParseJSON(json.errors[0].message);
        const errors = { ...defaultErrors, ...returnErrors };
        this.setState({ errors });
      }
    };
    const onSuccess = (response) => {
      const { userTwoFactorAuthentication: { user: { two_factor } } } = response;
      this.setState({
        twoFactorAuthentication: two_factor.otp_required,
        showFactorCommonFields: two_factor.otp_required,
        showFactorAuthForm: false,
        backupCodes: [],
        password: '',
      });
    };
    const isValid = this.validateInputs();
    if (isValid) {
      const { dbid } = this.props.user;
      Relay.Store.commitUpdate(
        new UserTwoFactorAuthenticationMutation({
          id: dbid,
          password: this.state.password,
          otp_required: enabled,
          qrcode: this.state.qrcode,
        }),
        { onSuccess, onFailure },
      );
    }
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

  handleGenerateBackupCodes() {
    const { dbid } = this.props.user;

    const onFailure = () => {};

    const onSuccess = (response) => {
      const { generateTwoFactorBackupCodes: { codes } } = response;
      this.setState({ backupCodes: codes });
    };

    Relay.Store.commitUpdate(
      new GenerateTwoFactorBackupCodesMutation({
        id: dbid,
      }),
      { onSuccess, onFailure },
    );
  }

  renderMessage(item) {
    switch (item) {
    case 'passwordInput':
      return this.props.intl.formatMessage(messages.passwordInput);
    case 'passwordError':
      return this.props.intl.formatMessage(messages.passwordError);
    case 'verifyInput':
      return this.props.intl.formatMessage(messages.verifyInput);
    case 'verifyError':
      return this.props.intl.formatMessage(messages.verifyError);
    default:
      return null;
    }
  }

  render() {
    const { user } = this.props;
    const { can_enable_otp, qrcode_svg } = user.two_factor;
    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

    const style = {
      margin: `${units(2)} 0`,
    };

    const cardTextStyle = {
      display: 'flex',
      alignItems: 'center',
    };

    const cardTextAuthStyle = {
      display: 'table-row',
      alignItems: 'center',
    };

    const subTitleStyle = {
      margin: '5px 0px',
      textTransform: 'uppercase',
    };

    const divBackupStyle = {
      lineHeight: units(3),
      fontWeight: 'bold',
      fontSize: units(1.5),
      backgroundColor: opaqueBlack10,
      margin: '5px',
      textAlign: 'center',
    };

    const appsUrls = {
      apple: 'https://apps.apple.com/us/app/google-authenticator/id388497605',
      play: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
      appleImage: '/images/two_factor/apple.png',
      playImage: '/images/two_factor/play.png',
    };

    // TODO: Read loginTrail from config
    const loginTrial = 4;

    return (
      <div id="user__security">
        <h2 style={style}>
          <FormattedMessage id="userSecurity.notification" defaultMessage="Notification" />
        </h2>
        <Card style={style}>
          <CardText style={cardTextStyle}>
            <span style={{ minWidth: units(64), padding: '0px' }}>
              <FormattedMessage
                id="userSecurity.successfulLoginText"
                defaultMessage="Receive a notification for logins from a new location or device"
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
            <span style={{ minWidth: units(64), padding: '0px' }}>
              <FormattedMessage
                id="userSecurity.failedfulLoginText"
                defaultMessage="Receive a notification for {loginTrial} consecutive failed login attempts"
                values={{ loginTrial }}
                style={{ minWidth: units(64), padding: '0px' }}
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
        <h2 style={style}>
          <FormattedMessage id="userSecurity.twoFactorAuthentication" defaultMessage="Two factor authentication" />
        </h2>
        {can_enable_otp === false ?
          <Card style={style}>
            <CardText style={cardTextStyle}>
              <FormattedMessage
                id="userSecurity.suggestTwoFactorForSocialAccounts"
                defaultMessage="In order to enable 2FA, you need to create a password on Check. Please do so in the 'Change password' section below."
                style={{ minWidth: units(64), padding: '0px' }}
              />
            </CardText>
          </Card>
          :
          <Card style={style}>
            <CardText style={cardTextStyle}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="userSecurity-require"
                    checked={this.state.twoFactorAuthentication || this.state.showFactorAuthForm}
                    onChange={this.handleTwoFactorAuthenticationForm.bind(this)}
                    disabled={this.state.twoFactorAuthentication}
                  />
                }
                label={
                  <FormattedMessage
                    id="userSecurity.requireTwoFactorAuth"
                    defaultMessage="Require two-factor authentication"
                  />
                }
              />
            </CardText>
            <div className="two-f-a-container" style={{ padding: '0px 25px 25px 25px' }}>
              <CardText style={cardTextAuthStyle}>
                {!this.state.showFactorAuthForm ?
                  null :
                  <div>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.authenticateHeader"
                        defaultMessage="Step 1: Authenticate"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.authenticateDescription"
                        defaultMessage="Enter your current password to confirm your identity:"
                      />
                    </span>
                  </div>
                }
                {this.state.twoFactorAuthentication ?
                  <span style={{ lineHeight: units(3) }}>
                    <FormattedMessage
                      id="userSecurity.disableAuthenticateDescription"
                      defaultMessage="Enter your password to disable two-factor authentication:"
                    />
                  </span>
                  : null }
                {this.state.showFactorCommonFields ?
                  <TextField
                    fullWidth
                    type="password"
                    name="password"
                    required
                    className="login__password-input"
                    onChange={this.handleFieldChange.bind(this)}
                    error={!this.state.errors.password}
                    helperText={this.state.errors.password ? null : this.renderMessage('passwordError')}
                    placeholder={this.renderMessage('passwordInput')}
                  />
                  : null
                }
                {this.state.twoFactorAuthentication ?
                  <CardText style={cardTextAuthStyle}>
                    <RaisedButton
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleSubmitTwoFactorAuthentication.bind(this, false)}
                      className="user-two-factor__enable-button"
                      label={
                        <FormattedMessage id="userSecurity.disableTwofactor" defaultMessage="Disable" />
                      }
                    />
                  </CardText>
                  : null
                }
              </CardText>
              {this.state.showFactorAuthForm ?
                <div>
                  <CardText style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.downloadHeader"
                        defaultMessage="Step 2: Download"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.downloadDescription"
                        defaultMessage="You'll need a two-factor app, like Google Authenticator, on your smartphone to proceed:"
                      />
                    </span>
                    <a href={appsUrls.apple} rel="noopener noreferrer" target="_blank" style={{ padding: '5px' }} >
                      <img src={appsUrls.appleImage} alt="" />
                    </a>
                    <a href={appsUrls.play} rel="noopener noreferrer" target="_blank" style={{ padding: '5px' }}>
                      <img src={appsUrls.playImage} alt="" />
                    </a>
                  </CardText>
                  <CardText style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.qrcodeHeader"
                        defaultMessage="Step 3: Scan"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.qrcodeDescription"
                        defaultMessage="Using your two-factor app, scan this QR code:"
                      />
                    </span>
                    <div
                      id="svg-container"
                      dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                        __html: qrcode_svg,
                      }}
                    />
                  </CardText>
                </div>
                : null
              }
              <CardText style={cardTextAuthStyle}>
                {this.state.showFactorAuthForm ?
                  <h3 style={subTitleStyle}>
                    <FormattedMessage
                      id="userSecurity.backupHeader"
                      defaultMessage="Step 4: Backup codes"
                    />
                  </h3>
                  : null
                }
                {this.state.showFactorCommonFields ?
                  <div>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.backupDescription"
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use tokens to be used instead of your two-factor token in the event that you lose access to your two-factor device."
                      />
                    </span>
                    <p>
                      <FormattedMessage
                        id="userSecurity.backupNote"
                        defaultMessage="Note: any existing backup codes will be invalidated by clicking the button."
                      />
                    </p>
                    <RaisedButton
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleGenerateBackupCodes.bind(this)}
                      className="user-two-factor__backup-button"
                      label={
                        <FormattedMessage id="userSecurity.generateGackup" defaultMessage="Generate backup code" />
                      }
                    />
                    {this.state.backupCodes.length === 0 ?
                      null :
                      <div style={divBackupStyle}>
                        {this.state.backupCodes.join(' - ')}
                      </div>
                    }
                  </div>
                  : null
                }
              </CardText>
              {this.state.showFactorAuthForm ?
                <div>
                  <CardText style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.verifyHeader"
                        defaultMessage="Step 5: Verify"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.verifyDescription"
                        defaultMessage="To enable two-factor authentication, enter the 6-digit token from your two-factor app:"
                      />
                    </span>
                    <TextField
                      fullWidth
                      type="text"
                      name="qrcode"
                      required
                      className="2fa__verify-code-input"
                      onChange={this.handleFieldChange.bind(this)}
                      error={!this.state.errors.qrcode}
                      helperText={this.state.errors.qrcode ? null : this.renderMessage('verifyError')}
                      placeholder={this.renderMessage('verifyInput')}
                    />
                  </CardText>
                  <CardText style={cardTextAuthStyle}>
                    <RaisedButton
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleSubmitTwoFactorAuthentication.bind(this, true)}
                      className="user-two-factor__enable-button"
                      label={
                        <FormattedMessage id="userSecurity.enableTwofactor" defaultMessage="Enable" />
                      }
                    />
                  </CardText>
                </div>
                : null
              }
            </div>
          </Card>
        }
        <h2 style={style}>
          <FormattedMessage id="userSecurity.changePassword" defaultMessage="Change password" />
        </h2>
        <Card style={style}>
          <CardText style={cardTextAuthStyle}>
            <ChangePasswordComponent
              type="update-password"
              show_current_password={can_enable_otp}
              user={this.props.user}
            />
          </CardText>
        </Card>
      </div>
    );
  }
}

UserSecurity.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserSecurity);
