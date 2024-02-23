import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SettingsHeader from '../team/SettingsHeader';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import ChangePasswordComponent from '../ChangePasswordComponent';
import CheckContext from '../../CheckContext';
import { getErrorMessage, getErrorObjects } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import {
  units,
} from '../../styles/js/shared';

const messages = defineMessages({
  passwordInput: {
    id: 'UserSecurity.passwordInput',
    defaultMessage: 'Current Password',
    description: 'Form label for current password field',
  },
  passwordError: {
    id: 'UserSecurity.passwordError',
    defaultMessage: 'Incorrect password',
    description: 'Error message output when an incorrect password is entered',
  },
  verifyInput: {
    id: 'UserSecurity.verifyInput',
    defaultMessage: 'Validation Code',
    description: 'Label for user to know to put in their login security validation code',
  },
  verifyError: {
    id: 'UserSecurity.verifyError',
    defaultMessage: 'Incorrect validation code',
    description: 'Error message if the login security validation code provided by the user is incorrect',
  },
  unknownError: {
    id: 'global.unknownError',
    defaultMessage: 'Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists.',
    description: 'Message displayed in error notification when an operation fails unexpectedly',
    values: {
      supportEmail: stringHelper('SUPPORT_EMAIL'),
    },
  },
});

const UserSecurity = (props, context) => {
  const { user } = props;
  let sendSuccessfulLoginValue = user.get_send_successful_login_notifications;
  if (user.get_send_successful_login_notifications == null) {
    sendSuccessfulLoginValue = true;
  }
  let sendFailedLoginValue = user.get_send_failed_login_notifications;
  if (user.get_send_failed_login_notifications == null) {
    sendFailedLoginValue = true;
  }
  const [twoFactorAuthentication, setTwoFactorAuthentication] = React.useState(user.two_factor.otp_required);
  const [showFactorAuthForm, setShowFactorAuthForm] = React.useState(false);
  const [sendSuccessfulLogin, setSendSuccessfulLogin] = React.useState(sendSuccessfulLoginValue);
  const [sendFailedLogin, setSendFailedLogin] = React.useState(sendFailedLoginValue);
  const [showFactorCommonFields, setShowFactorCommonFields] = React.useState(user.two_factor.otp_required);
  const [password, setPassword] = React.useState('');
  const [qrcode, setQrcode] = React.useState('');
  const [backupCodes, setBackupCodes] = React.useState([]);
  const [errors, setErrors] = React.useState({ password: true, qrcode: true });

  const fail = (transaction) => {
    const fallbackMessage = props.intl.formatMessage(messages.unknownError);
    const message = getErrorMessage(transaction, fallbackMessage);
    props.setFlashMessage(message, 'error');
  };

  const handleTwoFactorAuthenticationForm = (e, inputChecked) => {
    setShowFactorCommonFields(twoFactorAuthentication || inputChecked);
    setShowFactorAuthForm(inputChecked);
  };

  const validateInputs = () => {
    const newErrors = { password: true, qrcode: true };
    newErrors.password = password.length > 0;
    let isValid = newErrors.password;
    if (twoFactorAuthentication === false) {
      newErrors.qrcode = qrcode.length > 0;
      isValid = isValid && qrcode.length > 0;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitTwoFactorAuthentication = (enabled) => {
    const onFailure = (transaction) => {
      const newErrors = { password: true, qrcode: true };
      const transactionErrors = getErrorObjects(transaction);
      transactionErrors.forEach((item) => { newErrors[item.data.field] = item.data.valid; });
      setErrors(newErrors);
    };
    const onSuccess = (response) => {
      const { userTwoFactorAuthentication: { user: { two_factor } } } = response;
      setTwoFactorAuthentication(two_factor.otp_required);
      setShowFactorCommonFields(two_factor.otp_required);
      setShowFactorAuthForm(false);
      setBackupCodes([]);
      setPassword('');
    };
    const isValid = validateInputs();
    if (isValid) {
      const { dbid } = user;
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation UserSecurityUserTwoFactorAuthenticationMutation($input: UserTwoFactorAuthenticationInput!) {
            userTwoFactorAuthentication(input: $input) {
              success
              user { two_factor }
            }
          }
        `,
        variables: {
          input: {
            id: dbid,
            password,
            otp_required: enabled,
            qrcode,
          },
        },
        onCompleted: onSuccess,
        onError: onFailure,
      });
    }
  };

  const handleSecuritySettings = (type, e, inputChecked) => {
    const onSuccess = () => {
    };
    const input = { id: user.id };
    if (type === 'successfulLogin') {
      setSendSuccessfulLogin(inputChecked);
      input.send_successful_login_notifications = inputChecked;
    } else {
      setSendFailedLogin(inputChecked);
      input.send_failed_login_notifications = inputChecked;
    }
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation UserSecurityUpdateUserMutation($input: UpdateUserInput!) {
          updateUser(input: $input) {
            me {
              get_send_successful_login_notifications
              get_send_failed_login_notifications
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted: onSuccess,
      onError: fail,
    });
  };

  const handleGenerateBackupCodes = () => {
    const { dbid } = user;

    const onSuccess = (response) => {
      const { generateTwoFactorBackupCodes: { codes } } = response;
      setBackupCodes(codes);
    };
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation UserSecurityGenerateTwoFactorBackupCodesMutation($input: GenerateTwoFactorBackupCodesInput!) {
          generateTwoFactorBackupCodes(input: $input) {
           success
            codes
          }
        }
      `,
      variables: {
        input: {
          id: dbid,
        },
      },
      onCompleted: onSuccess,
      onError: fail,
    });
  };

  const renderMessage = (item) => {
    switch (item) {
    case 'passwordInput':
      return props.intl.formatMessage(messages.passwordInput);
    case 'passwordError':
      return props.intl.formatMessage(messages.passwordError);
    case 'verifyInput':
      return props.intl.formatMessage(messages.verifyInput);
    case 'verifyError':
      return props.intl.formatMessage(messages.verifyError);
    default:
      return null;
    }
  };

  const { can_enable_otp, qrcode_svg } = user.two_factor;
  const { currentUser } = new CheckContext({ props, context }).getContextStore();

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
  };

  const divBackupStyle = {
    lineHeight: units(3),
    fontWeight: 'bold',
    fontSize: units(1.5),
    backgroundColor: 'var(--grayBorderMain)',
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
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="userSettings.securityTitle"
            defaultMessage="Security"
            description="Title for user settings area for user security settings"
          />
        }
      />
      <div id="user__security">
        <div className="typography-subtitle2" style={style}>
          <FormattedMessage id="userSecurity.notification" defaultMessage="Notification" description="Section header title for security notification settings" />
        </div>
        <Card style={style}>
          <CardContent style={cardTextStyle}>
            <SwitchComponent
              inputProps={{
                id: 'edit-security__successfull-login-switch',
              }}
              checked={Boolean(sendSuccessfulLogin)}
              onChange={handleSecuritySettings.bind(this, 'successfulLogin', Boolean(sendSuccessfulLogin))}
              labelPlacement="start"
              label={<FormattedMessage
                id="userSecurity.successfulLoginText"
                defaultMessage="Receive a notification for logins from a new location or device"
                description="Label for switch input to allow users to determine if they get notifications on new logins"
              />}
            />
          </CardContent>
          <CardContent style={cardTextStyle}>
            <SwitchComponent
              inputProps={{
                id: 'edit-security__failed-login-switch',
              }}
              checked={Boolean(sendFailedLogin)}
              onChange={handleSecuritySettings.bind(this, 'failedLogin', Boolean(sendFailedLogin))}
              labelPlacement="start"
              label={<FormattedMessage
                id="userSecurity.failedfulLoginText"
                defaultMessage="Receive a notification for {loginTrial} consecutive failed login attempts"
                values={{ loginTrial }}
                description="Label for switch input to allow users to receive a notification if there are multiple failed login attempts with their credentials"
              />}
            />
          </CardContent>
        </Card>
        <div className="typography-subtitle2" style={style}>
          <FormattedMessage id="userSecurity.twoFactorAuthentication" defaultMessage="Two factor authentication" description="Sectiom title for two-factor authentication settings" />
        </div>
        {can_enable_otp === false ?
          <Card style={style}>
            <CardContent style={cardTextStyle}>
              <FormattedMessage
                id="userSecurity.suggestTwoFactorForSocialAccounts"
                defaultMessage="In order to enable 2FA, you need to create a password on Check. Please do so in the 'Change password' section below."
                description="Help text on how the user can generate a new password in order to set up two-factor authentication"
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
                    checked={twoFactorAuthentication || showFactorAuthForm}
                    onChange={handleTwoFactorAuthenticationForm.bind(this)}
                    disabled={twoFactorAuthentication}
                  />
                }
                label={
                  <FormattedMessage
                    id="userSecurity.requireTwoFactorAuth"
                    defaultMessage="Require two-factor authentication"
                    description="Section header title for security two-factor authentication settings"
                  />
                }
              />
            </CardContent>
            <div className="two-f-a-container" style={{ padding: '0px 25px 25px 25px' }}>
              <CardContent style={cardTextAuthStyle}>
                {!showFactorAuthForm ?
                  null :
                  <div>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.authenticateHeader"
                        defaultMessage="Step 1: Authenticate"
                        description="Sub title for first step in two-factor authentication settings"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.authenticateDescription"
                        defaultMessage="Enter your current password to confirm your identity:"
                        description="Sub title for current password confirmation step in two-factor authentication settings"
                      />
                    </span>
                  </div>
                }
                {twoFactorAuthentication ?
                  <span style={{ lineHeight: units(3) }}>
                    <FormattedMessage
                      id="userSecurity.disableAuthenticateDescription"
                      defaultMessage="Enter your password to disable two-factor authentication:"
                      description="Sub title for current password confirmation step in order to disable two-factor authentication"
                    />
                  </span>
                  : null }
                {showFactorCommonFields ?
                  <TextField
                    fullWidth
                    type="password"
                    name="password"
                    required
                    className="int-login__password-input"
                    onChange={e => setPassword(e.target.value)}
                    error={!errors.password}
                    helperText={errors.password ? null : renderMessage('passwordError')}
                    placeholder={renderMessage('passwordInput')}
                  />
                  : null
                }
                {twoFactorAuthentication ?
                  <CardContent style={cardTextAuthStyle}>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={handleSubmitTwoFactorAuthentication.bind(this, false)}
                      className="user-two-factor__enable-button"
                    >
                      <FormattedMessage id="userSecurity.disableTwofactor" defaultMessage="Disable" description="Button label to disable two-factor authentication settings" />
                    </Button>
                  </CardContent>
                  : null
                }
              </CardContent>
              {showFactorAuthForm ?
                <div>
                  <CardContent style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.downloadHeader"
                        defaultMessage="Step 2: Download"
                        description="Sub title for second step in two-factor authentication settings"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.downloadDescription"
                        defaultMessage="You'll need a two-factor app, like Google Authenticator, on your smartphone to proceed:"
                        description="Help message to tell the user how they can get a two factor authentication code using their smartphone"
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
                        description="Sub title for third step in two-factor authentication settings"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.qrcodeDescription"
                        defaultMessage="Using your two-factor app, scan this QR code:"
                        description="Help text to tell the user to scan the QR code from the app they downloaded in a previous step"
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
                {showFactorAuthForm ?
                  <h3 style={subTitleStyle}>
                    <FormattedMessage
                      id="userSecurity.backupHeader"
                      defaultMessage="Step 4: Backup codes"
                      description="Sub title for forth step in two-factor authentication settings"
                    />
                  </h3>
                  : null
                }
                {showFactorCommonFields ?
                  <div>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.backupDescription"
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use codes to be used instead of 2FA login in the event that you lose access to your 2FA device."
                        description="Help text description on the importance of backing up two-factor authentication codes"
                      />
                    </span>
                    <p>
                      <FormattedMessage
                        id="userSecurity.backupNote"
                        defaultMessage="Note: Existing backup codes will be invalidated by clicking this button."
                        description="Warning on the removal of existing two-factor authentication codes"
                      />
                    </p>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={handleGenerateBackupCodes.bind(this)}
                      className="user-two-factor__backup-button"
                    >
                      <FormattedMessage id="userSecurity.generateGackup" defaultMessage="Generate backup code" description="Button label to generate two-factor authentication backup codes" />
                    </Button>
                    {backupCodes.length === 0 ?
                      null :
                      <div style={divBackupStyle}>
                        {backupCodes.join(' - ')}
                      </div>
                    }
                  </div>
                  : null
                }
              </CardContent>
              {showFactorAuthForm ?
                <div>
                  <CardContent style={cardTextAuthStyle}>
                    <h3 style={subTitleStyle}>
                      <FormattedMessage
                        id="userSecurity.verifyHeader"
                        defaultMessage="Step 5: Verify"
                        description="Sub title for fifth step in two-factor authentication settings"
                      />
                    </h3>
                    <span style={{ lineHeight: units(3) }}>
                      <FormattedMessage
                        id="userSecurity.verifyDescription"
                        defaultMessage="To enable two-factor authentication, enter the 6-digit code from your two-factor app:"
                        description="Help text to let the user know where to get their authentication code to enter"
                      />
                    </span>
                    <TextField
                      fullWidth
                      type="text"
                      name="qrcode"
                      required
                      className="2fa__verify-code-input"
                      onChange={e => setQrcode(e.target.value)}
                      error={!errors.qrcode}
                      helperText={errors.qrcode ? null : renderMessage('verifyError')}
                      placeholder={renderMessage('verifyInput')}
                    />
                  </CardContent>
                  <CardContent style={cardTextAuthStyle}>
                    <Button
                      variant="contained"
                      style={{ marginLeft: 'auto', marginRight: units(2) }}
                      onClick={handleSubmitTwoFactorAuthentication.bind(this, true)}
                      className="user-two-factor__enable-button"
                    >
                      <FormattedMessage id="userSecurity.enableTwofactor" defaultMessage="Enable" description="Button label to enabled two-factor authentication settings" />
                    </Button>
                  </CardContent>
                </div>
                : null
              }
            </div>
          </Card>
        }
        <div className="typography-subtitle2" style={style}>
          <FormattedMessage id="userSecurity.changePassword" defaultMessage="Change password" description="Section title for making password changes" />
        </div>
        <Card className="user-password-reset__component">
          <CardContent>
            <ChangePasswordComponent
              type="update-password"
              showCurrentPassword={can_enable_otp}
              user={user}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

UserSecurity.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

UserSecurity.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(injectIntl(UserSecurity));
