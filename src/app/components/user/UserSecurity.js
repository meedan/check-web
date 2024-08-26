import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import AppleAppStoreIcon from '../../icons/apple_appstore_download.svg';
import GooglePlayAppStoreIcon from '../../icons/googleplay_appstore_download.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import SettingsHeader from '../team/SettingsHeader';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import ChangePasswordComponent from '../ChangePasswordComponent';
import CheckContext from '../../CheckContext';
import { getErrorMessage, getErrorObjects } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './user.module.css';

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

  const handleTwoFactorAuthenticationForm = (type, e, inputChecked) => {
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

  // TODO: Read loginTrail from config
  const loginTrial = 4;

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            defaultMessage="Security"
            description="Title for user settings area for user security settings"
            id="userSettings.securityTitle"
          />
        }
      />
      <div className={styles['user-setting-details-wrapper']} id="user__security">
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Notifications" description="Section header title for security notification settings" id="userSecurity.notification" />
          </div>
          <div className={inputStyles['form-fieldset']}>
            <SwitchComponent
              checked={Boolean(sendSuccessfulLogin)}
              className={inputStyles['form-fieldset-field']}
              inputProps={{
                id: 'edit-security__successfull-login-switch',
              }}
              label={<FormattedMessage
                defaultMessage="Receive a notification for logins from a new location or device"
                description="Label for switch input to allow users to determine if they get notifications on new logins"
                id="userSecurity.successfulLoginText"
              />}
              labelPlacement="end"
              onChange={handleSecuritySettings.bind(this, 'successfulLogin', Boolean(sendSuccessfulLogin))}
            />
            <SwitchComponent
              checked={Boolean(sendFailedLogin)}
              className={inputStyles['form-fieldset-field']}
              inputProps={{
                id: 'edit-security__failed-login-switch',
              }}
              label={<FormattedMessage
                defaultMessage="Receive a notification for {loginTrial} consecutive failed login attempts"
                description="Label for switch input to allow users to receive a notification if there are multiple failed login attempts with their credentials"
                id="userSecurity.failedfulLoginText"
                values={{ loginTrial }}
              />}
              labelPlacement="end"
              onChange={handleSecuritySettings.bind(this, 'failedLogin', Boolean(sendFailedLogin))}
            />
          </div>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Two factor authentication" description="Section title for two-factor authentication settings" id="userSecurity.twoFactorAuthentication" />
          </div>
          {can_enable_otp === false ?
            <FormattedMessage
              defaultMessage="In order to enable 2FA, you need to create a password on Check. Please do so in the 'Change password' section below."
              description="Help text on how the user can generate a new password in order to set up two-factor authentication"
              id="userSecurity.suggestTwoFactorForSocialAccounts"
              tagName="p"
            />
            :
            <>
              <SwitchComponent
                checked={Boolean(twoFactorAuthentication || showFactorAuthForm)}
                className={inputStyles['form-fieldset-field']}
                inputProps={{
                  id: 'userSecurity-require',
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Require two-factor authentication"
                    description="Section header title for security two-factor authentication settings"
                    id="userSecurity.requireTwoFactorAuth"
                  />
                }
                labelPlacement="end"
                onChange={handleTwoFactorAuthenticationForm.bind(this, 'twoFactor', Boolean(twoFactorAuthentication || showFactorAuthForm))}
              />
              {twoFactorAuthentication || showFactorAuthForm ?
                <div className={styles['user-setting-content-container-inner']}>
                  <div className={styles['user-setting-content-container-inner-accent']}>
                    {!showFactorAuthForm ?
                      null :
                      <>
                        <FormattedMessage
                          defaultMessage="Step 1: Authenticate"
                          description="Sub title for first step in two-factor authentication settings"
                          id="userSecurity.authenticateHeader"
                          tagName="h6"
                        />
                        <FormattedMessage
                          defaultMessage="Enter your current password to confirm your identity:"
                          description="Sub title for current password confirmation step in two-factor authentication settings"
                          id="userSecurity.authenticateDescription"
                          tagName="p"
                        />
                      </>
                    }
                    {twoFactorAuthentication ?
                      <FormattedMessage
                        defaultMessage="Enter your password to disable two-factor authentication:"
                        description="Sub title for current password confirmation step in order to disable two-factor authentication"
                        id="userSecurity.disableAuthenticateDescription"
                        tagName="p"
                      />
                      : null }
                    <div className={inputStyles['form-fieldset']}>
                      {showFactorCommonFields ?
                        <TextField
                          className={cx('int-login__password-input', inputStyles['form-fieldset-field'])}
                          componentProps={{
                            type: 'password',
                            name: 'password',
                          }}
                          error={!errors.password}
                          helpContent={errors.password ? null : renderMessage('passwordError')}
                          label={renderMessage('passwordInput')}
                          placeholder={renderMessage('passwordInput')}
                          required
                          onChange={e => setPassword(e.target.value)}
                        />
                        : null
                      }
                      {twoFactorAuthentication ?
                        <div className={inputStyles['form-fieldset-field']}>
                          <ButtonMain
                            className="user-two-factor__enable-button"
                            label={
                              <FormattedMessage defaultMessage="Disable" description="Button label to disable two-factor authentication settings" id="userSecurity.disableTwofactor" />
                            }
                            size="default"
                            theme="info"
                            variant="contained"
                            onClick={handleSubmitTwoFactorAuthentication.bind(this, false)}
                          />
                        </div>
                        : null
                      }
                    </div>
                  </div>
                  {showFactorAuthForm ?
                    <>
                      <div className={styles['user-setting-content-container-inner-accent']}>
                        <FormattedMessage
                          defaultMessage="Step 2: Download"
                          description="Sub title for second step in two-factor authentication settings"
                          id="userSecurity.downloadHeader"
                          tagName="h6"
                        />
                        <FormattedMessage
                          defaultMessage="You'll need a two-factor app, like Google Authenticator, on your smartphone to proceed:"
                          description="Help message to tell the user how they can get a two factor authentication code using their smartphone"
                          id="userSecurity.downloadDescription"
                          tagName="p"
                        />
                        <div className={styles['appstore-badges']}>
                          <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" rel="noopener noreferrer" target="_blank">
                            <AppleAppStoreIcon className={styles['appstore-apple']} />
                          </a>
                          <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" rel="noopener noreferrer" target="_blank">
                            <GooglePlayAppStoreIcon className={styles['appstore-play']} />
                          </a>
                        </div>
                      </div>
                      <div className={styles['user-setting-content-container-inner-accent']}>
                        <FormattedMessage
                          defaultMessage="Step 3: Scan"
                          description="Sub title for third step in two-factor authentication settings"
                          id="userSecurity.qrcodeHeader"
                          tagName="h6"
                        />
                        <FormattedMessage
                          defaultMessage="Using your two-factor app, scan this QR code:"
                          description="Help text to tell the user to scan the QR code from the app they downloaded in a previous step"
                          id="userSecurity.qrcodeDescription"
                          tagName="p"
                        />
                        <div
                          dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                            __html: qrcode_svg,
                          }}
                          id="svg-container"
                        />
                      </div>
                    </>
                    : null
                  }
                  {showFactorCommonFields ?
                    <div className={styles['user-setting-content-container-inner-accent']}>
                      {showFactorAuthForm ?
                        <FormattedMessage
                          defaultMessage="Step 4: Backup codes"
                          description="Sub title for forth step in two-factor authentication settings"
                          id="userSecurity.backupHeader"
                          tagName="h6"
                        />
                        :
                        <FormattedMessage
                          defaultMessage="Backup codes"
                          description="Sub title for backup codes section when two-factor authentication is already enabled"
                          id="userSecurity.backupCodesHeader"
                          tagName="h6"
                        />
                      }
                      <FormattedMessage
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use codes to be used instead of 2FA login in the event that you lose access to your 2FA device."
                        description="Help text description on the importance of backing up two-factor authentication codes"
                        id="userSecurity.backupDescription"
                        tagName="p"
                      />
                      <FormattedMessage
                        defaultMessage="Note: Existing backup codes will be invalidated by clicking this button."
                        description="Warning on the removal of existing two-factor authentication codes"
                        id="userSecurity.backupNote"
                        tagName="p"
                      />
                      <ButtonMain
                        className="user-two-factor__backup-button"
                        label={
                          <FormattedMessage defaultMessage="Generate backup code" description="Button label to generate two-factor authentication backup codes" id="userSecurity.generateGackup" />
                        }
                        size="default"
                        theme="info"
                        variant="contained"
                        onClick={handleGenerateBackupCodes.bind(this)}
                      />
                      {backupCodes.length === 0 ?
                        null :
                        <div>
                          {backupCodes.join(' - ')}
                        </div>
                      }
                    </div>
                    : null
                  }
                  {showFactorAuthForm ?
                    <div className={styles['user-setting-content-container-inner-accent']}>
                      <FormattedMessage
                        defaultMessage="Step 5: Verify"
                        description="Sub title for fifth step in two-factor authentication settings"
                        id="userSecurity.verifyHeader"
                        tagName="h6"
                      />
                      <FormattedMessage
                        defaultMessage="To enable two-factor authentication, enter the 6-digit code from your two-factor app:"
                        description="Help text to let the user know where to get their authentication code to enter"
                        id="userSecurity.verifyDescription"
                        tagName="p"
                      />
                      <div className={inputStyles['form-fieldset']}>
                        <TextField
                          className={cx('2fa__verify-code-input', inputStyles['form-fieldset-field'])}
                          componentProps={{
                            name: 'qrcode',
                          }}
                          error={!errors.qrcode}
                          helpContent={errors.qrcode ? null : renderMessage('verifyError')}
                          label={renderMessage('verifyInput')}
                          placeholder={renderMessage('verifyInput')}
                          required
                          onChange={e => setQrcode(e.target.value)}
                        />
                        <div className={inputStyles['form-fieldset-field']}>
                          <ButtonMain
                            className="user-two-factor__enable-button"
                            label={
                              <FormattedMessage defaultMessage="Enable" description="Button label to enabled two-factor authentication settings" id="userSecurity.enableTwofactor" />
                            }
                            size="default"
                            theme="info"
                            variant="contained"
                            onClick={handleSubmitTwoFactorAuthentication.bind(this, true)}
                          />
                        </div>
                      </div>
                    </div>
                    : null
                  }
                </div> : null
              }
            </>
          }
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Change password" description="Section title for making password changes" id="userSecurity.changePassword" />
          </div>
          <div className="user-password-reset__component">
            <ChangePasswordComponent
              showCurrentPassword={can_enable_otp}
              type="update-password"
              user={user}
            />
          </div>
        </div>
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
