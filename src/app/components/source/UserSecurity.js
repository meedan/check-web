import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import Switch from '@material-ui/core/Switch';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SetUserSecuritySettingsMutation from '../../relay/mutations/SetUserSecuritySettingsMutation';
import GenerateTwoFactorBackupCodesMutation from '../../relay/mutations/GenerateTwoFactorBackupCodesMutation';
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
    const showFactorAuthForm = false;
    const showFactorCommonFields = props.user.two_factor.otp_required || showFactorAuthForm;
    this.state = {
      twoFactorAuthentication: props.user.two_factor.otp_required,
      showFactorAuthForm,
      sendSuccessfulLogin,
      sendFailedLogin,
      showFactorCommonFields,
      backupCodes: [],
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleTwoFactorAuthenticationForm(e, inputChecked) {
    const showFactorCommonFields = this.state.twoFactorAuthentication || inputChecked;
    this.setState({
      showFactorAuthForm: inputChecked,
      showFactorCommonFields,
    });
    // Relay.Store.commitUpdate(
    //   new UpdateUserMutation({
    //     two_factor: this.state.showFactorAuthForm,
    //     current_user_id: this.props.user.id,
    //   }),
    //   { onSuccess: () => {}, onFailure: () => {} },
    // );
  }

  disableTwoFactorAuthentication() {
    this.setState({
      showFactorAuthForm: false,
      showFactorCommonFields: false,
      twoFactorAuthentication: false,
    });
    // Relay.Store.commitUpdate(
    //   new UpdateUserMutation({
    //     two_factor: false,
    //     current_user_id: this.props.user.id,
    //   }),
    //   { onSuccess: () => {}, onFailure: () => {} },
    // );
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

    const onFailure = () => {
    };
    const onSuccess = (response) => {
      const { generateTwoFactorBackupCodes: { codes } } = response;
      this.setState({ backupCodes: codes });
      console.log('BackupCodes', this.state.backupCodes);
    };

    Relay.Store.commitUpdate(
      new GenerateTwoFactorBackupCodesMutation({
        id: dbid,
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

    const cardTextAuthStyle = {
      display: 'table-row',
      alignItems: 'center',
    };

    const subTitleStyle = {
      margin: '5px 0px',
      textTransform: 'uppercase',
    };

    const divBackupStyle = {
      lineHeight: '25px',
      fontWeight: 'bold',
      fontSize: '12px',
      backgroundColor: '#dfdfe6',
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
    console.log('this.state', this.state);

    return (
      <div id="user__security">
        <h2 style={style}>
          <FormattedMessage id="userSecurity.notification" defaultMessage="Notification" />
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
        </Card>
        <h2 style={style}>
          <FormattedMessage id="userSecurity.twoFactorAuthentication" defaultMessage="Two factor authntication" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <Checkbox
              id="userSecurity-require"
              checked={this.state.twoFactorAuthentication || this.state.showFactorAuthForm}
              onCheck={this.handleTwoFactorAuthenticationForm.bind(this)}
              disabled={this.state.twoFactorAuthentication}
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
                    {
                      <FormattedMessage
                        id="userSecurity.authenticateHeader"
                        defaultMessage="Step 1: Authenticate"
                      />
                    }
                  </h3>
                  <span style={{ lineHeight: '25px' }}>
                    {
                      <FormattedMessage
                        id="userSecurity.authenticateDescription"
                        defaultMessage="Enter your current password to confirm your identity:"
                      />
                    }
                  </span>
                </div>
              }
              {this.state.twoFactorAuthentication ?
                <span style={{ lineHeight: '25px' }}>
                  {
                    <FormattedMessage
                      id="userSecurity.disableAuthenticateDescription"
                      defaultMessage="Enter your password to disable two-factor authentication:"
                    />
                  }
                </span>
                : null }
              {this.state.showFactorCommonFields ?
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  required
                  label="Should add lable here"
                  className="login__password-input"
                  floatingLabelText={
                    <FormattedMessage
                      id="userSecurity.currentPasswordInputHint"
                      defaultMessage="Current Password"
                    />
                  }
                />
                : null
              }
              {this.state.twoFactorAuthentication ?
                <CardText style={cardTextAuthStyle}>
                  <RaisedButton
                    style={{ marginLeft: 'auto', marginRight: units(2) }}
                    onClick={this.handleTwoFactorAuthenticationForm.bind(this)}
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
                    {
                      <FormattedMessage
                        id="userSecurity.downloadHeader"
                        defaultMessage="Step 2: Download"
                      />
                    }
                  </h3>
                  <span style={{ lineHeight: '25px' }}>
                    {
                      <FormattedMessage
                        id="userSecurity.downloadDescription"
                        defaultMessage="You'll need a two-factor app, like Google Authenticator, on your smartphone to proceed:"
                      />
                    }
                  </span>
                  <Link to={appsUrls.apple} target="_blank" style={{ padding: '5px' }} >
                    <img src={appsUrls.appleImage} alt="" />
                  </Link>
                  <Link to={appsUrls.play} target="_blank" style={{ padding: '5px' }}>
                    <img src={appsUrls.playImage} alt="" />
                  </Link>
                </CardText>
                <CardText style={cardTextAuthStyle}>
                  <h3 style={subTitleStyle}>
                    {
                      <FormattedMessage
                        id="userSecurity.qrcodeHeader"
                        defaultMessage="Step 3: Scan"
                      />
                    }
                  </h3>
                  <span style={{ lineHeight: '25px' }}>
                    {
                      <FormattedMessage
                        id="userSecurity.qrcodeDescription"
                        defaultMessage="Using your two-factor app, scan this QR code:"
                      />
                    }
                  </span>
                  <div
                    id="svg-container"
                    dangerouslySetInnerHTML={{
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
                  {
                    <FormattedMessage
                      id="userSecurity.backupHeader"
                      defaultMessage="Step 4: Backup codes"
                    />
                  }
                </h3>
                : null
              }
              {this.state.showFactorCommonFields ?
                <div>
                  <span style={{ lineHeight: '25px' }}>
                    {
                      <FormattedMessage
                        id="userSecurity.backupDescription"
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use tokens to be used instead of your two-factor token in the event that you lose access to your two-factor device."
                      />
                    }
                  </span>
                  <p>
                    {
                      <FormattedMessage
                        id="userSecurity.backupNote"
                        defaultMessage="Note: any existing backup codes will be invalidated by clicking the button."
                      />
                    }
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
                    {
                      <FormattedMessage
                        id="userSecurity.verifyHeader"
                        defaultMessage="Step 5: Verify"
                      />
                    }
                  </h3>
                  <span style={{ lineHeight: '25px' }}>
                    {
                      <FormattedMessage
                        id="userSecurity.verifyDescription"
                        defaultMessage="To enable two-factor authentication, enter the 6-digit token from your two-factor app:"
                      />
                    }
                  </span>
                  <TextField
                    fullWidth
                    type="text"
                    name="verifyCode"
                    required
                    label="Should add lable here"
                    className="2fa__verify-code-input"
                    floatingLabelText={
                      <FormattedMessage
                        id="userSecurity.verifyInputHint"
                        defaultMessage="Validation Code"
                      />
                    }
                  />
                </CardText>
                <CardText style={cardTextAuthStyle}>
                  <RaisedButton
                    style={{ marginLeft: 'auto', marginRight: units(2) }}
                    onClick={this.handleTwoFactorAuthenticationForm.bind(this)}
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
      </div>
    );
  }
}

UserSecurity.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserSecurity);
