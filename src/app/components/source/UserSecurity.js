import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import SettingsHeader from '../team/SettingsHeader';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import ChangePasswordComponent from '../ChangePasswordComponent';
import CheckContext from '../../CheckContext';
import { getErrorMessage, getErrorObjects } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import styles from './User.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

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
      <div id="user__security" className={styles['user-setting-details-wrapper']}>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage id="userSecurity.notification" defaultMessage="Notifications" description="Section header title for security notification settings" />
          </div>
          <div className={inputStyles['form-fieldset']}>
            <SwitchComponent
              inputProps={{
                id: 'edit-security__successfull-login-switch',
              }}
              className={inputStyles['form-fieldset-field']}
              checked={Boolean(sendSuccessfulLogin)}
              onChange={handleSecuritySettings.bind(this, 'successfulLogin', Boolean(sendSuccessfulLogin))}
              labelPlacement="end"
              label={<FormattedMessage
                id="userSecurity.successfulLoginText"
                defaultMessage="Receive a notification for logins from a new location or device"
                description="Label for switch input to allow users to determine if they get notifications on new logins"
              />}
            />
            <SwitchComponent
              inputProps={{
                id: 'edit-security__failed-login-switch',
              }}
              className={inputStyles['form-fieldset-field']}
              checked={Boolean(sendFailedLogin)}
              onChange={handleSecuritySettings.bind(this, 'failedLogin', Boolean(sendFailedLogin))}
              labelPlacement="end"
              label={<FormattedMessage
                id="userSecurity.failedfulLoginText"
                defaultMessage="Receive a notification for {loginTrial} consecutive failed login attempts"
                values={{ loginTrial }}
                description="Label for switch input to allow users to receive a notification if there are multiple failed login attempts with their credentials"
              />}
            />
          </div>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage id="userSecurity.twoFactorAuthentication" defaultMessage="Two factor authentication" description="Section title for two-factor authentication settings" />
          </div>
          {can_enable_otp === false ?
            <FormattedMessage
              tagName="p"
              id="userSecurity.suggestTwoFactorForSocialAccounts"
              defaultMessage="In order to enable 2FA, you need to create a password on Check. Please do so in the 'Change password' section below."
              description="Help text on how the user can generate a new password in order to set up two-factor authentication"
            />
            :
            <>
              <SwitchComponent
                inputProps={{
                  id: 'userSecurity-require',
                }}
                className={inputStyles['form-fieldset-field']}
                checked={Boolean(twoFactorAuthentication || showFactorAuthForm)}
                onChange={handleTwoFactorAuthenticationForm.bind(this, 'twoFactor', Boolean(twoFactorAuthentication || showFactorAuthForm))}
                labelPlacement="end"
                label={
                  <FormattedMessage
                    id="userSecurity.requireTwoFactorAuth"
                    defaultMessage="Require two-factor authentication"
                    description="Section header title for security two-factor authentication settings"
                  />
                }
              />
              {twoFactorAuthentication || showFactorAuthForm ?
                <div className={styles['user-setting-content-container-inner']}>
                  <div className={styles['user-setting-content-container-inner-accent']}>
                    {!showFactorAuthForm ?
                      null :
                      <>
                        <FormattedMessage
                          tagName="h6"
                          id="userSecurity.authenticateHeader"
                          defaultMessage="Step 1: Authenticate"
                          description="Sub title for first step in two-factor authentication settings"
                        />
                        <FormattedMessage
                          tagName="p"
                          id="userSecurity.authenticateDescription"
                          defaultMessage="Enter your current password to confirm your identity:"
                          description="Sub title for current password confirmation step in two-factor authentication settings"
                        />
                      </>
                    }
                    {twoFactorAuthentication ?
                      <FormattedMessage
                        tagName="p"
                        id="userSecurity.disableAuthenticateDescription"
                        defaultMessage="Enter your password to disable two-factor authentication:"
                        description="Sub title for current password confirmation step in order to disable two-factor authentication"
                      />
                      : null }
                    <div className={inputStyles['form-fieldset']}>
                      {showFactorCommonFields ?
                        <TextField
                          required
                          className={cx('int-login__password-input', inputStyles['form-fieldset-field'])}
                          componentProps={{
                            type: 'password',
                            name: 'password',
                          }}
                          onChange={e => setPassword(e.target.value)}
                          label={renderMessage('passwordInput')}
                          placeholder={renderMessage('passwordInput')}
                          helpContent={errors.password ? null : renderMessage('passwordError')}
                          error={!errors.password}
                        />
                        : null
                      }
                      {twoFactorAuthentication ?
                        <div className={inputStyles['form-fieldset-field']}>
                          <ButtonMain
                            variant="contained"
                            theme="brand"
                            size="default"
                            onClick={handleSubmitTwoFactorAuthentication.bind(this, false)}
                            className="user-two-factor__enable-button"
                            label={
                              <FormattedMessage id="userSecurity.disableTwofactor" defaultMessage="Disable" description="Button label to disable two-factor authentication settings" />
                            }
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
                          tagName="h6"
                          id="userSecurity.downloadHeader"
                          defaultMessage="Step 2: Download"
                          description="Sub title for second step in two-factor authentication settings"
                        />
                        <FormattedMessage
                          tagName="p"
                          id="userSecurity.downloadDescription"
                          defaultMessage="You'll need a two-factor app, like Google Authenticator, on your smartphone to proceed:"
                          description="Help message to tell the user how they can get a two factor authentication code using their smartphone"
                        />
                        <a href={appsUrls.apple} rel="noopener noreferrer" target="_blank">
                          <img src={appsUrls.appleImage} alt="" />
                        </a>
                        <a href={appsUrls.play} rel="noopener noreferrer" target="_blank">
                          <img src={appsUrls.playImage} alt="" />
                        </a>
                      </div>
                      <div className={styles['user-setting-content-container-inner-accent']}>
                        <FormattedMessage
                          tagName="h6"
                          id="userSecurity.qrcodeHeader"
                          defaultMessage="Step 3: Scan"
                          description="Sub title for third step in two-factor authentication settings"
                        />
                        <FormattedMessage
                          tagName="p"
                          id="userSecurity.qrcodeDescription"
                          defaultMessage="Using your two-factor app, scan this QR code:"
                          description="Help text to tell the user to scan the QR code from the app they downloaded in a previous step"
                        />
                        <div
                          id="svg-container"
                          dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
                            __html: qrcode_svg,
                          }}
                        />
                      </div>
                    </>
                    : null
                  }
                  {showFactorCommonFields ?
                    <div className={styles['user-setting-content-container-inner-accent']}>
                      {showFactorAuthForm ?
                        <FormattedMessage
                          tagName="h6"
                          id="userSecurity.backupHeader"
                          defaultMessage="Step 4: Backup codes"
                          description="Sub title for forth step in two-factor authentication settings"
                        />
                        :
                        <FormattedMessage
                          tagName="h6"
                          id="userSecurity.backupCodesHeader"
                          defaultMessage="Backup codes"
                          description="Sub title for backup codes section when two-factor authentication is already enabled"
                        />
                      }
                      <FormattedMessage
                        tagName="p"
                        id="userSecurity.backupDescription"
                        defaultMessage="We strongly suggest that you generate and print backup codes using the button below. These are single-use codes to be used instead of 2FA login in the event that you lose access to your 2FA device."
                        description="Help text description on the importance of backing up two-factor authentication codes"
                      />
                      <FormattedMessage
                        tagName="p"
                        id="userSecurity.backupNote"
                        defaultMessage="Note: Existing backup codes will be invalidated by clicking this button."
                        description="Warning on the removal of existing two-factor authentication codes"
                      />
                      <ButtonMain
                        variant="contained"
                        theme="brand"
                        size="default"
                        onClick={handleGenerateBackupCodes.bind(this)}
                        className="user-two-factor__backup-button"
                        label={
                          <FormattedMessage id="userSecurity.generateGackup" defaultMessage="Generate backup code" description="Button label to generate two-factor authentication backup codes" />
                        }
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
                        tagName="h6"
                        id="userSecurity.verifyHeader"
                        defaultMessage="Step 5: Verify"
                        description="Sub title for fifth step in two-factor authentication settings"
                      />
                      <FormattedMessage
                        tagName="p"
                        id="userSecurity.verifyDescription"
                        defaultMessage="To enable two-factor authentication, enter the 6-digit code from your two-factor app:"
                        description="Help text to let the user know where to get their authentication code to enter"
                      />
                      <div className={inputStyles['form-fieldset']}>
                        <TextField
                          required
                          className={cx('2fa__verify-code-input', inputStyles['form-fieldset-field'])}
                          componentProps={{
                            name: 'qrcode',
                          }}
                          onChange={e => setQrcode(e.target.value)}
                          label={renderMessage('verifyInput')}
                          placeholder={renderMessage('verifyInput')}
                          helpContent={errors.qrcode ? null : renderMessage('verifyError')}
                          error={!errors.qrcode}
                        />
                        <div className={inputStyles['form-fieldset-field']}>
                          <ButtonMain
                            variant="contained"
                            theme="brand"
                            size="default"
                            onClick={handleSubmitTwoFactorAuthentication.bind(this, true)}
                            className="user-two-factor__enable-button"
                            label={
                              <FormattedMessage id="userSecurity.enableTwofactor" defaultMessage="Enable" description="Button label to enabled two-factor authentication settings" />
                            }
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
            <FormattedMessage id="userSecurity.changePassword" defaultMessage="Change password" description="Section title for making password changes" />
          </div>
          <div className="user-password-reset__component">
            <ChangePasswordComponent
              type="update-password"
              showCurrentPassword={can_enable_otp}
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
