import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import cx from 'classnames/bind';
import GoogleColorIcon from '../../icons/google_color.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import UserTosForm from '../UserTosForm';
import { login, request } from '../../redux/actions';
import { FormattedGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorObjects } from '../../helpers';
import CheckError from '../../CheckError';
import {
  units,
  StyledSubHeader,
} from '../../styles/js/shared';
import styles2 from './login.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const styles = {
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  primaryButton: {
    display: 'block',
    margin: `${units(2)} auto`,
    width: '80%',
  },
  orDivider: {
    padding: `${units(3)} 0`,
  },
};

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
      const { message, code } = errors[0];
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
      const { message, code } = errors[0];
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
        message: <FormattedMessage id="login.tosMissing" defaultMessage="You must agree to the Terms of Service and Privacy Policy" description="Error message to tell the user they must agree to the app terms of service before continuing" />,
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
      <div id="login" className={cx('login', styles2['login-form'])}>
        <form onSubmit={this.onFormSubmit.bind(this)} className="login__form">
          <FormattedGlobalMessage messageKey="appNameHuman">
            {appNameHuman => (
              <img
                style={styles.logo}
                alt={appNameHuman}
                width="120"
                className="login__icon"
                src={stringHelper('LOGO_URL')}
              />
            )}
          </FormattedGlobalMessage>
          <StyledSubHeader className="login__heading">
            {this.state.type === 'login' ?
              <FormattedMessage
                id="login.title"
                defaultMessage="Sign in"
                description="Header title for the sign in page"
              /> :
              <FormattedMessage
                id="login.registerTitle"
                defaultMessage="Register"
                description="Header title for the new user registration page"
              />}
          </StyledSubHeader>
          {this.state.type === 'login' ?
            <ButtonMain
              size="default"
              theme="lightText"
              variant="outlined"
              onClick={this.oAuthLogin.bind(this, 'google_oauth2')}
              iconLeft={<GoogleColorIcon />}
              label={
                <FormattedMessage
                  id="login.withGoogle"
                  defaultMessage="Sign in with Google"
                  description="Button label for the user to sign in to the app using their google credentials"
                />
              }
            /> : null
          }
          {this.state.type === 'login' ?
            <Grid container alignItems="center" spacing={3} style={styles.orDivider}>
              <Grid item xs>
                <hr />
              </Grid>
              <Grid item>
                <FormattedMessage
                  id="login.emailLogin"
                  defaultMessage="Or, sign in with your email"
                  description="Button label for the user to sign in to the app using their email address"
                />
              </Grid>
              <Grid item xs>
                <hr />
              </Grid>
            </Grid> : null
          }
          {this.state.message &&
            <Alert
              content={this.state.message}
              variant={this.state.registrationSubmitted ? 'info' : 'error'}
            />
          }
          {this.state.registrationSubmitted ?
            null :
            <div className={inputStyles['form-fieldset']}>
              {this.state.type === 'login' ?
                null :
                <div className="login__name">
                  <TextField
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    name="name"
                    value={this.state.name}
                    className={cx('login__name-input', inputStyles['form-fieldset-field'])}
                    inputRef={(i) => { this.inputName = i; }}
                    onChange={this.handleFieldChange.bind(this)}
                    label={<FormattedMessage id="login.nameLabel" defaultMessage="Name" description="Text field label for the user's name" />}
                  />
                </div>}

              <div className="login__email">
                <TextField
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  type="email"
                  name="email"
                  value={this.state.email}
                  className={cx('login__email-input', inputStyles['form-fieldset-field'])}
                  inputRef={(i) => { this.inputEmail = i; }}
                  onChange={this.handleFieldChange.bind(this)}
                  label={
                    <FormattedMessage id="login.emailLabel" defaultMessage="Email" description="Text field label for the user's email address" />
                  }
                  autoFocus
                />
              </div>

              <div className="login__password">
                <TextField
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  type="password"
                  name="password"
                  value={this.state.password}
                  className={cx('login__password-input', inputStyles['form-fieldset-field'])}
                  onChange={this.handleFieldChange.bind(this)}
                  label={this.state.type === 'login' ? (
                    <FormattedMessage id="login.passwordInputHint" defaultMessage="Password" description="Text field label for the user's password" />
                  ) : (
                    <FormattedMessage
                      id="login.passwordLabel"
                      defaultMessage="Password (minimum 8 characters)"
                      description="Text field description for password input telling the user it much be at least 8 characters long when signing up"
                    />
                  )}
                />
              </div>

              {this.state.type === 'login' && this.state.showOtp ?
                <div className="login__otp_attempt">
                  <TextField
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    name="otp_attempt"
                    value={this.state.otp_attempt}
                    className={cx('login__otp_attempt-input', inputStyles['form-fieldset-field'])}
                    onChange={this.handleFieldChange.bind(this)}
                    label={
                      <FormattedMessage
                        id="login.otpAttemptLabel"
                        defaultMessage="Two-Factor Authentication Token"
                        description="Text field label for the user's two-factor authentication token"
                      />
                    }
                  />
                </div> : null}

              {this.state.type === 'login' ?
                null :
                <div className="login__password-confirmation">
                  <TextField
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    type="password"
                    name="passwordConfirmation"
                    value={this.state.passwordConfirmation}
                    className={cx('login__password-confirmation-input', inputStyles['form-fieldset-field'])}
                    onChange={this.handleFieldChange.bind(this)}
                    label={
                      <FormattedMessage
                        id="login.passwordConfirmLabel"
                        defaultMessage="Password confirmation"
                        description="Text field label for the to confirm their password"
                      />
                    }
                  />
                </div>}

              {this.state.type === 'login' ?
                null :
                <UserTosForm
                  user={{}}
                  showTitle={false}
                  handleCheckTos={this.handleCheckTos.bind(this)}
                  checkedTos={this.state.checkedTos}
                />}

              <div className="login__actions">
                <ButtonMain
                  size="default"
                  theme="brand"
                  variant="contained"
                  buttonProps={{
                    id: 'submit-register-or-login',
                    type: 'submit',
                  }}
                  className={`login__submit login__submit--${this.state.type}`}
                  label={this.state.type === 'login' ?
                    <FormattedMessage
                      id="login.signIn"
                      defaultMessage="Sign in"
                      description="Sign in button label"
                    /> :
                    <FormattedMessage
                      id="login.signUp"
                      defaultMessage="Sign up"
                      description="Sign up button label"
                    />
                  }
                />
                {this.state.type === 'login' ?
                  <span className="login__forgot-password">
                    <Link to="/check/user/password-reset">
                      <FormattedMessage
                        id="loginEmail.lostPassword"
                        defaultMessage="Forgot your password?"
                        description="Link for the user to initiate a password reset if they do not know it"
                      />
                    </Link>
                  </span>
                  : null}
              </div>
              {this.state.type === 'login' ? (
                <div>
                  <FormattedMessage
                    id="login.newAccount"
                    defaultMessage="Don't have an account?"
                    description="Description to help the user sign up instead of logging in"
                  />
                  <ButtonMain
                    size="default"
                    theme="lightBrand"
                    variant="contained"
                    onClick={this.handleSwitchToRegister}
                    buttonProps={{
                      id: 'register',
                    }}
                    label={
                      <FormattedMessage
                        id="login.signUpLink"
                        defaultMessage="Sign up"
                        description="Button label. Switches from 'logging in' to 'create new account' mode"
                      />
                    }
                  />
                </div>
              ) : (
                <div>
                  <FormattedMessage
                    id="login.alreadyHasAccount"
                    defaultMessage="Already have an account?"
                    description="Description to help the user login instead of signing up"
                  />
                  <ButtonMain
                    size="default"
                    theme="lightBrand"
                    variant="contained"
                    buttonProps={{
                      id: 'login',
                    }}
                    onClick={this.handleSwitchToLogin}
                    label={
                      <FormattedMessage
                        id="login.signInLink"
                        defaultMessage="Sign in"
                        description="Button label. Switches from 'create new account' to 'logging in' mode"
                      />
                    }
                  />
                </div>
              )}
            </div>}
        </form>
      </div>
    );
  }
}

export default Login;
