/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SvgIcon from '@material-ui/core/SvgIcon';
import Message from './Message';
import UserTosForm from './UserTosForm';
import { login, request } from '../redux/actions';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import { getErrorObjects } from '../helpers';
import CheckError from '../CheckError';
import {
  units,
  opaqueBlack54,
  StyledSubHeader,
  StyledCard,
  brandMain,
} from '../styles/js/shared';

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
  secondaryButton: {
    display: 'block',
    color: opaqueBlack54,
    maxWidth: units(26),
    margin: `${units(2)} auto`,
  },
  googleButton: {
    border: '2px solid #D5D5D5',
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
        message: <FormattedMessage id="login.tosMissing" defaultMessage="You must agree to the Terms of Service and Privacy Policy" />,
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
      <div className="login" id="login">
        <StyledCard>
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
                /> :
                <FormattedMessage
                  id="login.registerTitle"
                  defaultMessage="Register"
                />}
            </StyledSubHeader>
            {this.state.type === 'login' ?
              <Button
                fullWidth
                style={styles.googleButton}
                onClick={this.oAuthLogin.bind(this, 'google_oauth2')}
                // eslint-disable-next-line
                startIcon={<SvgIcon viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></SvgIcon>}
              >
                <FormattedMessage
                  id="login.withGoogle"
                  defaultMessage="Sign in with Google"
                />
              </Button> : null
            }
            {this.state.type === 'login' ?
              <Grid container alignItems="center" spacing={3} style={styles.orDivider}>
                <Grid item xs>
                  <Divider />
                </Grid>
                <Grid item>
                  <FormattedMessage
                    id="login.emailLogin"
                    defaultMessage="Or, sign in with your email"
                  />
                </Grid>
                <Grid item xs>
                  <Divider />
                </Grid>
              </Grid> : null
            }
            <Message
              message={this.state.message}
              style={this.state.registrationSubmitted ? {
                backgroundColor: brandMain,
              } : null}
            />
            {this.state.registrationSubmitted ?
              null :
              <div>
                {this.state.type === 'login' ?
                  null :
                  <div className="login__name">
                    <TextField
                      margin="normal"
                      fullWidth
                      variant="outlined"
                      name="name"
                      value={this.state.name}
                      className="login__name-input"
                      inputRef={(i) => { this.inputName = i; }}
                      onChange={this.handleFieldChange.bind(this)}
                      label={<FormattedMessage id="login.nameLabel" defaultMessage="Name" />}
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
                    className="login__email-input"
                    inputRef={(i) => { this.inputEmail = i; }}
                    onChange={this.handleFieldChange.bind(this)}
                    label={
                      <FormattedMessage id="login.emailLabel" defaultMessage="Email" />
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
                    className="login__password-input"
                    onChange={this.handleFieldChange.bind(this)}
                    label={this.state.type === 'login' ? (
                      <FormattedMessage id="login.passwordInputHint" defaultMessage="Password" />
                    ) : (
                      <FormattedMessage
                        id="login.passwordLabel"
                        defaultMessage="Password (minimum 8 characters)"
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
                      className="login__otp_attempt-input"
                      onChange={this.handleFieldChange.bind(this)}
                      label={
                        <FormattedMessage
                          id="login.otpAttemptLabel"
                          defaultMessage="Two-Factor Authentication Token"
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
                      className="login__password-confirmation-input"
                      onChange={this.handleFieldChange.bind(this)}
                      label={
                        <FormattedMessage
                          id="login.passwordConfirmLabel"
                          defaultMessage="Password confirmation"
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
                  {this.state.type === 'login' ?
                    <span className="login__forgot-password">
                      <Link to="/check/user/password-reset">
                        <Button style={styles.secondaryButton}>
                          <FormattedMessage
                            id="loginEmail.lostPassword"
                            defaultMessage="Forgot your password?"
                          />
                        </Button>
                      </Link>
                    </span>
                    : null}
                  <Button
                    variant="contained"
                    color="primary"
                    style={styles.primaryButton}
                    type="submit"
                    id="submit-register-or-login"
                    className={`login__submit login__submit--${this.state.type}`}
                  >
                    {this.state.type === 'login' ?
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
                  </Button>
                </div>
                {this.state.type === 'login' ? (
                  <Typography component="div" align="center">
                    <FormattedMessage
                      id="login.newAccount"
                      defaultMessage="Don't have an account ?"
                    />
                    <Button
                      color="primary"
                      id="register"
                      onClick={this.handleSwitchToRegister}
                    >
                      <FormattedMessage
                        id="login.signUpLink"
                        defaultMessage="Sign up"
                        description="Button label. Switches from 'logging in' to 'create new account' mode"
                      />
                    </Button>
                  </Typography>
                ) : (
                  <Typography component="div" align="center">
                    <FormattedMessage
                      id="login.alreadyHasAccount"
                      defaultMessage="Already have an account ?"
                    />
                    <Button
                      color="primary"
                      id="login"
                      onClick={this.handleSwitchToLogin}
                    >
                      <FormattedMessage
                        id="login.signInLink"
                        defaultMessage="Sign in"
                        description="Button label. Switches from 'create new account' to 'logging in' mode"
                      />
                    </Button>
                  </Typography>
                )}
              </div>}
          </form>
        </StyledCard>
      </div>
    );
  }
}

export default Login;
