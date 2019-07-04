import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Card, CardText } from 'material-ui/Card';
import Switch from '@material-ui/core/Switch';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import SetUserSecuritySettingsMutation from '../../relay/mutations/SetUserSecuritySettingsMutation';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';
import CheckContext from '../../CheckContext';
import { units } from '../../styles/js/shared';

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
      twoFactorAuthentication: props.user.two_factor.enabled,
      showFactorAuthForm: false,
      sendSuccessfulLogin,
      sendFailedLogin,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleTwoFactorAuthentication(e, inputChecked) {
    this.setState({ showFactorAuthForm: inputChecked });
    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        two_factor: this.state.showFactorAuthForm,
        current_user_id: this.props.user.id,
      }),
      { onSuccess: () => {}, onFailure: () => {} },
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
    const { qrcode_svg } = user.two_factor;
    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

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

    // TODO: Read loginTrail from config
    const loginTrial = 4;

    return (
      <div id="user__security">
        <h2 style={style}>
          <FormattedMessage id="userSecurity.security" defaultMessage="Security" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <span style={{ minWidth: '500px', padding: '0px' }}>
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
            <span style={{ minWidth: '500px', padding: '0px' }}>
              <FormattedMessage
                id="userSecurity.failedfulLoginText"
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
          <CardText style={cardTextStyle}>
            <span style={{ minWidth: '500px', padding: '0px' }}>
              <FormattedMessage
                id="userSecurity.twoFactorAuthentication"
                defaultMessage="TWO-FACTOR AUTHENTICATION"
              />
            </span>
          </CardText>
          <div style={{ margin: `${units(4)} 0` }}>
            <Checkbox
              id="userSecurity-require"
              checked={this.state.twoFactorAuthentication}
              onCheck={this.handleTwoFactorAuthentication.bind(this)}
              disabled={this.state.twoFactorAuthentication}
              label={
                <FormattedMessage
                  id="userSecurity.requireTwoFactorAuth"
                  defaultMessage=" Require two-factor authentication"
                />
              }
            />
          </div>
          {this.state.showFactorAuthForm === false ?
            'Form to disable 2FA' :
            <div className="two-f-a-container" style={{ padding: '0px 30px' }}>
              <form>
                <div className="2fa__password">
                  <h3> STEP 1: AUTHENTICATE </h3>
                  <label>
                    Enter your current password to confirm your identity:
                    <TextField
                      fullWidth
                      type="password"
                      name="password"
                      className="login__password-input"
                      floatingLabelText={
                        <FormattedMessage
                          id="login.passwordInputHint"
                          defaultMessage="Password"
                        />
                      }
                    />
                  </label>
                </div>
                <div className="twoFactorAuth__apps">
                  <h3> STEP 2: DOWNLOAD </h3>
                  <p>Download two-factor app, like Google Authenticator:</p>
                  <img
                    src="https://web-assets.tinfoilsecurity.com/assets/app_stores/apple-39249d2fdb21f47f09282220bf8f856e5828c38808f0ccd2d726d7ccad25f546.png"
                    alt="Apple"
                  />
                  <img
                    src="https://web-assets.tinfoilsecurity.com/assets/app_stores/play-5df0c47fe9d9936de20e98e246affb00200361758277eb23316bbeccb4cce27f.png"
                    alt="Play"
                  />
                </div>
                <div className="twoFactorAuth__qrcode">
                  <h3> STEP 3: SCAN </h3>
                  <p>Using your two-factor app, scan this QR code:</p>
                  <div
                    id="svg-container"
                    dangerouslySetInnerHTML={{
                      __html: qrcode_svg,
                    }}
                  />
                </div>
                <div className="2fa__backup">
                  <h3> STEP 4: PRINT BACKUP CODES </h3>
                  <h2 style={Object.assign({}, style, { marginTop: units(6) })}>
                    <FormattedMessage id="userSecurity.backupCode" defaultMessage="Download Backup Codes" />
                  </h2>
                </div>
                <div className="2fa__verify">
                  <h3> STEP 5: VERIFY </h3>
                  <label>
                    Enter the 6-digit token from your two-factor app:
                    <TextField
                      fullWidth
                      type="text"
                      name="verifyCode"
                      className="2fa__verify-code-input"
                      floatingLabelText={
                        <FormattedMessage
                          id="userSecurity.verifyInputHint"
                          defaultMessage="Validation Code"
                        />
                      }
                    />
                  </label>
                </div>
              </form>
            </div>
          }
        </Card>
      </div>
    );
  }
}

UserSecurity.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserSecurity);
