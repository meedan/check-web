import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import cx from 'classnames/bind';
import GoogleColorIcon from '../../icons/google_color.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import { login, request } from '../../redux/actions';
import { FormattedGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorObjects } from '../../helpers';
import CheckError from '../../constants/CheckError';
import CheckAgreeTerms from '../CheckAgreeTerms';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './login.module.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      email: '',
      password: '',
      otp_attempt: '',
      checkedTos: false,
      showOtp: false,
    };
  }

  onFormSubmit(e) {
    e.preventDefault();
    this.emailLogin();
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  emailLogin() {
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
      'api_user[otp_attempt]': this.state.otp_attempt,
    };

    const failureCallback = (transaction) => {
      const errors = getErrorObjects(transaction);
      const { code, message } = errors[0];
      const showOtp =
        (code === CheckError.codes.LOGIN_2FA_REQUIRED) ||
        this.state.showOtp;
      this.setState({ message, showOtp });
    };

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      browserHistory.push('/');
    };

    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  oAuthLogin(provider) {
    login(provider, this.props.loginCallback);
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div className={cx('login', styles['login-form'])} id="login">
        <form className="login__form" onSubmit={this.onFormSubmit.bind(this)}>
          <FormattedGlobalMessage messageKey="appNameHuman">
            {appNameHuman => (
              <img
                alt={appNameHuman}
                className={cx('login__icon', styles['login-logo'])}
                src={stringHelper('LOGO_URL')}
                width="120"
              />
            )}
          </FormattedGlobalMessage>
          <h6 className="login__heading">
            <FormattedMessage
              defaultMessage="Sign in"
              description="Header title for the sign in page"
              id="login.title"
            />
          </h6>
          <div className={styles['login-form-choice']}>
            <ButtonMain
              iconLeft={<GoogleColorIcon />}
              label={
                <FormattedMessage
                  defaultMessage="Sign in with Google"
                  description="Button label for the user to sign in to the app using their google credentials"
                  id="login.withGoogle"
                />
              }
              size="default"
              theme="lightText"
              variant="outlined"
              onClick={this.oAuthLogin.bind(this, 'google_oauth2')}
            />
            <div className={styles['login-form-choice-divider']}>
              <FormattedMessage
                defaultMessage="Or, sign in with your email"
                description="Button label for the user to sign in to the app using their email address"
                id="login.emailLogin"
                tagName="p"
              />
            </div>
          </div>
          {this.state.message &&
            <Alert
              className={cx('message', styles['login-form-alert'])}
              content={this.state.message}
              variant={this.state.registrationSubmitted ? 'info' : 'error'}
            />
          }
          {this.state.registrationSubmitted ?
            null :
            <>
              <div className={inputStyles['form-fieldset']}>
                <TextField
                  autoFocus
                  className={cx('int-login__email-input', inputStyles['form-fieldset-field'])}
                  componentProps={{
                    type: 'email',
                    name: 'email',
                  }}
                  label={
                    <FormattedMessage defaultMessage="Email" description="Text field label for the user's email address" id="login.emailLabel" />
                  }
                  ref={(i) => { this.inputEmail = i; }}
                  required
                  value={this.state.email}
                  onChange={this.handleFieldChange.bind(this)}
                />

                <TextField
                  className={cx('int-login__password-input', inputStyles['form-fieldset-field'])}
                  componentProps={{
                    type: 'password',
                    name: 'password',
                  }}
                  label={<FormattedMessage defaultMessage="Password" description="Text field label for the user's password" id="login.passwordInputHint" />}
                  required
                  value={this.state.password}
                  onChange={this.handleFieldChange.bind(this)}
                />

                {this.state.showOtp ?
                  <div className="login__otp_attempt">
                    <TextField
                      className={cx('login__otp_attempt-input', inputStyles['form-fieldset-field'])}
                      componentProps={{
                        name: 'otp_attempt',
                      }}
                      label={
                        <FormattedMessage
                          defaultMessage="Two-Factor Authentication Token"
                          description="Text field label for the user's two-factor authentication token"
                          id="login.otpAttemptLabel"
                        />
                      }
                      required
                      value={this.state.otp_attempt}
                      onChange={this.handleFieldChange.bind(this)}
                    />
                  </div> : null
                }
                <div className={cx(styles['login-agree-terms'])}>
                  <CheckAgreeTerms />
                </div>

                <div className="login__actions">
                  <ButtonMain
                    buttonProps={{
                      id: 'submit-register-or-login',
                      type: 'submit',
                    }}
                    className="login__submit login__submit--login"
                    label={<FormattedMessage defaultMessage="Sign in" description="Sign in button label" id="login.signIn" />}
                    size="default"
                    theme="info"
                    variant="contained"
                  />
                  <Link className={cx('login__forgot-password', styles['login-forgot-password-action'])} to="/check/user/password-reset">
                    <FormattedMessage
                      defaultMessage="Forgot your password?"
                      description="Link for the user to initiate a password reset if they do not know it"
                      id="loginEmail.lostPassword"
                    />
                  </Link>
                </div>
              </div>
            </>
          }
        </form>
      </div>
    );
  }
}

export default Login;
