import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import cx from 'classnames/bind';
import GoogleColorIcon from '../../icons/google_color.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import UserTosForm from '../UserTosForm';
import { login, request } from '../../redux/actions';
import { FormattedGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorObjects } from '../../helpers';
import CheckError from '../../CheckError';
import CheckAgreeTerms from '../CheckAgreeTerms';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './login.module.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'login', // or 'register'
      message: null,
      name: '',
      email: '',
      password: '',
      otp_attempt: '',
      passwordConfirmation: '',
      checkedTos: false,
      showOtp: false,
    };
  }

  onFormSubmit(e) {
    e.preventDefault();

    if (this.state.type === 'login') {
      this.emailLogin();
    } else {
      this.registerEmail();
    }
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  handleSwitchToRegister = () => {
    this.setState({ type: 'register', registrationSubmitted: false, message: null }, () => {
      this.inputName.focus();
    });
  }

  handleSwitchToLogin = () => {
    this.setState({ type: 'login', registrationSubmitted: false, message: null }, () => {
      this.inputEmail.focus();
    });
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

  registerEmail() {
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.passwordConfirmation,
    };

    const failureCallback = (transaction) => {
      const errors = getErrorObjects(transaction);
      const { code, message } = errors[0];
      if (code === CheckError.codes.UNAUTHORIZED) {
        this.setState({ registrationSubmitted: true });
      }
      this.setState({ message });
      window.scroll(0, 0);
    };

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      browserHistory.push(window.location.pathname);
    };

    if (this.state.checkedTos) {
      request('post', 'users', failureCallback, successCallback, params);
    } else {
      this.setState({
        message: <FormattedMessage defaultMessage="You must agree to the Terms of Service and Privacy Policy" description="Error message to tell the user they must agree to the app terms of service before continuing" id="login.tosMissing" />,
      });
      window.scroll(0, 0);
    }
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
            {this.state.type === 'login' ?
              <FormattedMessage
                defaultMessage="Sign in"
                description="Header title for the sign in page"
                id="login.title"
              /> :
              <FormattedMessage
                defaultMessage="Register"
                description="Header title for the new user registration page"
                id="login.registerTitle"
              />}
          </h6>
          {this.state.type === 'login' ?
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
            </div> : null
          }
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
                {this.state.type === 'login' ?
                  null :
                  <TextField
                    className={cx('login__name-input', inputStyles['form-fieldset-field'])}
                    componentProps={{
                      name: 'name',
                    }}
                    label={<FormattedMessage defaultMessage="Name" description="Text field label for the user's name" id="login.nameLabel" />}
                    ref={(i) => { this.inputName = i; }}
                    required
                    value={this.state.name}
                    onChange={this.handleFieldChange.bind(this)}
                  />
                }

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
                  label={this.state.type === 'login' ? (
                    <FormattedMessage defaultMessage="Password" description="Text field label for the user's password" id="login.passwordInputHint" />
                  ) : (
                    <FormattedMessage
                      defaultMessage="Password (minimum 8 characters)"
                      description="Text field description for password input telling the user it much be at least 8 characters long when signing up"
                      id="login.passwordLabel"
                    />
                  )}
                  required
                  value={this.state.password}
                  onChange={this.handleFieldChange.bind(this)}
                />

                {this.state.type === 'login' && this.state.showOtp ?
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

                {this.state.type === 'login' ?
                  null :
                  <div className="int-login__password-confirmation">
                    <TextField
                      className={cx('int-login__password-confirmation-input', inputStyles['form-fieldset-field'])}
                      componentProps={{
                        type: 'password',
                        name: 'passwordConfirmation',
                      }}
                      label={
                        <FormattedMessage
                          defaultMessage="Password confirmation"
                          description="Text field label for the to confirm their password"
                          id="login.passwordConfirmLabel"
                        />
                      }
                      required
                      value={this.state.passwordConfirmation}
                      onChange={this.handleFieldChange.bind(this)}
                    />
                  </div>
                }

                {this.state.type === 'login' ?
                  null :
                  <div className={cx(styles['login-agree-terms'])}>
                    <UserTosForm
                      checkedTos={this.state.checkedTos}
                      handleCheckTos={this.handleCheckTos.bind(this)}
                      showTitle={false}
                      user={{}}
                    />
                  </div>
                }
                {this.state.type === 'login' ?
                  <div className={cx(styles['login-agree-terms'])}>
                    <CheckAgreeTerms />
                  </div>
                  : null
                }
                <div className="login__actions">
                  <ButtonMain
                    buttonProps={{
                      id: 'submit-register-or-login',
                      type: 'submit',
                    }}
                    className={`login__submit login__submit--${this.state.type}`}
                    label={this.state.type === 'login' ?
                      <FormattedMessage
                        defaultMessage="Sign in"
                        description="Sign in button label"
                        id="login.signIn"
                      /> :
                      <FormattedMessage
                        defaultMessage="Sign up"
                        description="Sign up button label"
                        id="login.signUp"
                      />
                    }
                    size="default"
                    theme="info"
                    variant="contained"
                  />
                  {this.state.type === 'login' ?
                    <Link className={cx('login__forgot-password', styles['login-forgot-password-action'])} to="/check/user/password-reset">
                      <FormattedMessage
                        defaultMessage="Forgot your password?"
                        description="Link for the user to initiate a password reset if they do not know it"
                        id="loginEmail.lostPassword"
                      />
                    </Link>
                    : null}
                </div>
              </div>
              {this.state.type === 'login' ? (
                <ButtonMain
                  buttonProps={{
                    id: 'register',
                  }}
                  className={styles['login-secondary-action']}
                  label={
                    <FormattedHTMLMessage
                      defaultMessage="Don't have an account? <strong>Sign up</strong>"
                      description="Button label. Switches from 'logging in' to 'create new account' mode"
                      id="login.signUpLink"
                    />
                  }
                  size="default"
                  theme="lightText"
                  variant="outlined"
                  onClick={this.handleSwitchToRegister}
                />
              ) : (
                <ButtonMain
                  buttonProps={{
                    id: 'login',
                  }}
                  className={styles['login-secondary-action']}
                  label={
                    <FormattedHTMLMessage
                      defaultMessage="Already have an account? <strong>Sign in</strong>"
                      description="Button label. Switches from 'create new account' to 'logging in' mode"
                      id="login.signInLink"
                    />
                  }
                  size="default"
                  theme="lightText"
                  variant="outlined"
                  onClick={this.handleSwitchToLogin}
                />
              )}
            </>
          }
        </form>
      </div>
    );
  }
}

export default Login;
