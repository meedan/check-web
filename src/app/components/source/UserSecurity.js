import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ChangePasswordComponent from '../ChangePasswordComponent';
import SetUserSecuritySettingsMutation from '../../relay/mutations/SetUserSecuritySettingsMutation';
import GenerateTwoFactorBackupCodesMutation from '../../relay/mutations/GenerateTwoFactorBackupCodesMutation';
import UserTwoFactorAuthenticationMutation from '../../relay/mutations/UserTwoFactorAuthenticationMutation';
import CheckContext from '../../CheckContext';
import { getErrorMessage, getErrorObjects } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import { units, opaqueBlack10, StyledPasswordChange } from '../../styles/js/shared';

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
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message, 'error');
  };

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
      const errors = { password: true, qrcode: true };
      const transactionErrors = getErrorObjects(transaction);
      transactionErrors.forEach((item) => { errors[item.data.field] = item.data.valid; });
      this.setState({ errors });
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
      { onSuccess, onFailure: this.fail },
    );
  }

  handleGenerateBackupCodes() {
    const { dbid } = this.props.user;

    const onSuccess = (response) => {
      const { generateTwoFactorBackupCodes: { codes } } = response;
      this.setState({ backupCodes: codes });
    };

    Relay.Store.commitUpdate(
      new GenerateTwoFactorBackupCodesMutation({
        id: dbid,
      }),
      { onSuccess, onFailure: this.fail },
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
          <CardContent style={cardTextStyle}>
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
          </CardContent>
          <CardContent style={cardTextStyle}>
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
          </CardContent>
        </Card>
        <h2 style={style}>
          <FormattedMessage id="userSecurity.twoFactorAuthentication" defaultMessage="Two factor authentication" />
        </h2>
        {can_enable_otp === false ?
          <Card style={style}>
            <CardContent style={cardTextStyle}>
              <FormattedMessage
                id="userSecurity.suggestTwoFactorForSocialAccounts"
                defaultMessage="In order to enable 2FA, you need to create a password on Check. Please do so in the 'Change password' section below."
                style={{ minWidth: units(64), padding: '0px' }}
              />
            </CardContent>
          </Card>
          :
          <Card style={style}>
            <CardContent style={cardTextStyle}>
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
            </CardContent>
            <div className="two-f-a-container" style={{ padding: '0px 25px 25px 25px' }}>
              <CardContent style={cardTextAuthStyle}>
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
                  <CardContent style={cardTextAuthStyle}>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleSubmitTwoFactorAuthentication.bind(this, false)}
                      className="user-two-factor__enable-button"
                    >
                      <FormattedMessage id="userSecurity.disableTwofactor" defaultMessage="Disable" />
                    </Button>
                  </CardContent>
                  : null
                }
              </CardContent>
              {this.state.showFactorAuthForm ?
                <div>
                  <CardContent style={cardTextAuthStyle}>
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
                  </CardContent>
                  <CardContent style={cardTextAuthStyle}>
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
                  </CardContent>
                </div>
                : null
              }
              <CardContent style={cardTextAuthStyle}>
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
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use codes to be used instead of 2FA login in the event that you lose access to your 2FA device."
                      />
                    </span>
                    <p>
                      <FormattedMessage
                        id="userSecurity.backupNote"
                        defaultMessage="Note: Existing backup codes will be invalidated by clicking this button."
                      />
                    </p>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleGenerateBackupCodes.bind(this)}
                      className="user-two-factor__backup-button"
                    >
                      <FormattedMessage id="userSecurity.generateGackup" defaultMessage="Generate backup code" />
                    </Button>
                    {this.state.backupCodes.length === 0 ?
                      null :
                      <div style={divBackupStyle}>
                        {this.state.backupCodes.join(' - ')}
                      </div>
                    }
                  </div>
                  : null
                }
              </CardContent>
              {this.state.showFactorAuthForm ?
                <div>
                  <CardContent style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.verifyHeader"
                        defaultMessage="Step 5: Verify"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.verifyDescription"
                        defaultMessage="To enable two-factor authentication, enter the 6-digit code from your two-factor app:"
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
                  </CardContent>
                  <CardContent style={cardTextAuthStyle}>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={this.handleSubmitTwoFactorAuthentication.bind(this, true)}
                      className="user-two-factor__enable-button"
                    >
                      <FormattedMessage id="userSecurity.enableTwofactor" defaultMessage="Enable" />
                    </Button>
                  </CardContent>
                </div>
                : null
              }
            </div>
          </Card>
        }
        <h2 style={style}>
          <FormattedMessage id="userSecurity.changePassword" defaultMessage="Change password" />
        </h2>
        <StyledPasswordChange>
          <Card style={style} className="user-password-change__card">
            <CardContent>
              <ChangePasswordComponent
                type="update-password"
                show_current_password={can_enable_otp}
                user={this.props.user}
              />
            </CardContent>
          </Card>
        </StyledPasswordChange>
      </div>
    );
  }
}

UserSecurity.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

UserSecurity.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(injectIntl(UserSecurity));
