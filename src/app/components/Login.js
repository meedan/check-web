import React, { Component } from 'react';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import FASlack from 'react-icons/lib/fa/slack';
import FAFacebook from 'react-icons/lib/fa/facebook-official';
import FATwitter from 'react-icons/lib/fa/twitter';
import MDEmail from 'react-icons/lib/md/email';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import rtlDetect from 'rtl-detect';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card } from 'material-ui/Card';
import styled from 'styled-components';
import merge from 'lodash.merge';
import Message from './Message';
import UploadImage from './UploadImage';
import CheckContext from '../CheckContext';
import { login, request } from '../redux/actions';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import { muiThemeWithoutRtl, units, media, black54 } from '../styles/js/variables';

const StyledCard = styled(Card)`
  padding: ${units(11)} ${units(15)} ${units(3)} !important;
  ${media.handheld`
    padding: ${units(8)} ${units(4)} ${units(3)} !important;
  `}
`;

const styles = {
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  buttonGroup: {
    marginTop: units(8),
  },
  primaryButton: {
    display: 'block',
    margin: `${units(2)} auto`,
    maxWidth: units(21),
  },
  secondaryButton: {
    display: 'block',
    color: black54,
    maxWidth: units(26),
    margin: `${units(2)} auto`,
  },
};
const messages = defineMessages({
  passwordInputHint: {
    id: 'login.passwordInputHint',
    defaultMessage: 'Password',
  },
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'login', // or 'register'
      message: null,
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    };
  }

  componentDidMount() {
    this.focusFirstInput();
  }

  onFormSubmit(e) {
    e.preventDefault();

    if (this.state.type === 'login') {
      this.emailLogin();
    } else {
      this.registerEmail();
    }
  }

  onImage(file) {
    document.forms.register.image = file;
  }

  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  handleSwitchType() {
    const type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({ type }, () => this.focusFirstInput());
  }

  focusFirstInput() {
    const input = document.querySelector('.login input');
    if (input) {
      input.focus();
    }
  }

  emailLogin() {
    const history = this.getHistory();
    const that = this;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
    };

    const failureCallback = message => that.setState({ message });

    const successCallback = () => {
      that.setState({ message: null });
      that.props.loginCallback();
      history.push('/');
    };

    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    const history = this.getHistory();
    const that = this;
    const form = document.forms.register;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.password_confirmation,
      'api_user[image]': form.image,
    };

    const failureCallback = message => that.setState({ message });

    const successCallback = () => {
      that.setState({ message: null });
      that.props.loginCallback();
      history.push(window.location.pathname);
    };

    request('post', 'users', failureCallback, successCallback, params);
  }

  oAuthLogin(provider) {
    login(provider, this.props.loginCallback);
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    const muiThemeWithRtl = getMuiTheme(
      merge(muiThemeWithoutRtl, { isRtl: rtlDetect.isRtlLang(this.props.intl.locale) }),
    );

    return (
      <MuiThemeProvider muiTheme={muiThemeWithRtl}>
        <div className="login" id="login">
          <StyledCard>
            <form
              name={this.state.type}
              onSubmit={this.onFormSubmit.bind(this)}
              className="login__form"
            >
              <img style={styles.logo} alt={mapGlobalMessage(this.props.intl, 'appNameHuman')} width="120" className="login__icon" src={stringHelper('LOGO_URL')} />
              <h2 style={{ textAlign: 'center' }} className="login__heading">
                {this.state.type === 'login'
                  ? <FormattedMessage id="login.title" defaultMessage="Sign in" />
                  : <FormattedMessage id="login.registerTitle" defaultMessage="Register" />}
              </h2>
              <Message message={this.state.message} />
              {this.state.type === 'login'
                ? null
                : <div className="login__name">
                  <TextField
                    fullWidth
                    name="name"
                    value={this.state.name}
                    className="login__name-input"
                    onChange={this.handleFieldChange.bind(this)}
                    floatingLabelText={<FormattedMessage id="login.nameLabel" defaultMessage="Your name" />}
                  />
                </div>}

              <div className="login__email">
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  value={this.state.email}
                  className="login__email-input"
                  id="login__email-input"
                  onChange={this.handleFieldChange.bind(this)}
                  floatingLabelText={<FormattedMessage id="login.emailLabel" defaultMessage="Email address" />}
                />
              </div>

              <div className="login__password">
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  value={this.state.password}
                  className="login__password-input"
                  id="login__password-input"
                  onChange={this.handleFieldChange.bind(this)}
                  floatingLabelText={this.state.type === 'login'
                  ? this.props.intl.formatMessage(messages.passwordInputHint)
                  : <FormattedMessage
                    id="login.passwordLabel"
                    defaultMessage="Password (minimum 8 characters)"
                  />
                  }
                />
              </div>

              {this.state.type === 'login'
                ? null
                : <div className="login__password-confirmation">
                  <TextField
                    fullWidth
                    type="password"
                    name="password_confirmation"
                    value={this.state.password_confirmation}
                    className="login__password-confirmation-input"
                    id="login__password-confirmation-input"
                    onChange={this.handleFieldChange.bind(this)}
                    floatingLabelText={
                      <FormattedMessage
                        id="login.passwordConfirmLabel"
                        defaultMessage="Password confirmation"
                      />
                    }
                  />
                </div>}

              {this.state.type === 'login' ? null : <UploadImage onImage={this.onImage.bind(this)} />}

              <div className="login__actions" style={styles.buttonGroup}>
                <RaisedButton
                  primary
                  style={styles.primaryButton}
                  type="submit"
                  id="submit-register-or-login"
                  className={`login__submit login__submit--${this.state.type}`}
                  label={this.state.type === 'login'
                    ? <FormattedMessage id="login.signIn" defaultMessage="SIGN IN" />
                    : <FormattedMessage id="login.signUp" defaultMessage="REGISTER" />}
                />

                {this.state.type === 'login'
                  ? <span className="login__forgot-password">
                    <FlatButton
                      href="/check/user/password-reset"
                      style={styles.secondaryButton}
                      label={
                        <FormattedMessage
                          id="loginEmail.lostPassword"
                          defaultMessage="Forgot password"
                        />
                      }
                    />
                  </span>
                  : null}

              </div>
            </form>
          </StyledCard>
          <ul className="login__oauth-list">
            <li>
              <button
                onClick={this.oAuthLogin.bind(this, 'slack')}
                id="slack-login"
                className="login__button login__button--slack"
              >
                <span className="login__link">
                  <FASlack className="logo" />
                  <FormattedMessage
                    id="login.with"
                    defaultMessage={'Continue with {provider}'}
                    values={{ provider: 'Slack' }}
                  />
                </span>
                <FormattedMessage
                  id="login.disclaimer"
                  defaultMessage={'We won’t publish without your permission'}
                />
              </button>
            </li>
            <li className="item">
              <button
                onClick={this.oAuthLogin.bind(this, 'twitter')}
                id="twitter-login"
                className="login__button login__button--twitter"
              >
                <span className="login__link">
                  <FATwitter className="logo" />
                  <FormattedMessage
                    id="login.with"
                    defaultMessage={'Continue with {provider}'}
                    values={{ provider: 'Twitter' }}
                  />
                </span>
                <FormattedMessage
                  id="login.disclaimer"
                  defaultMessage={'We won’t publish without your permission'}
                />
              </button>
            </li>
            <li>
              <button
                onClick={this.oAuthLogin.bind(this, 'facebook')}
                id="facebook-login"
                className="login__button login__button--facebook"
              >
                <span className="login__link">
                  <FAFacebook className="logo" />
                  <FormattedMessage
                    id="login.with"
                    defaultMessage={'Continue with {provider}'}
                    values={{ provider: 'Facebook' }}
                  />
                </span>
                <FormattedMessage
                  id="login.disclaimer"
                  defaultMessage={'We won’t publish without your permission'}
                />
              </button>
            </li>
            <li>
              {this.state.type === 'login'
                ? <button
                  type="button"
                  id="register-or-login"
                  onClick={this.handleSwitchType.bind(this)}
                  className="login__button login__button--email"
                >
                  <span className="login__link">
                    <MDEmail />
                    <FormattedMessage
                      id="login.newAccount"
                      defaultMessage="Create a new account with email"
                    />
                  </span>
                  <FormattedMessage
                    id="login.disclaimer"
                    defaultMessage={'We won’t publish without your permission'}
                  />
                </button>
                : <button
                  type="button"
                  id="register-or-login"
                  onClick={this.handleSwitchType.bind(this)}
                  className="login__button login__button--email"
                >
                  <span className="login__link">
                    <MDEmail />
                    <FormattedMessage
                      id="login.alreadyHasAccount"
                      defaultMessage="I already have an account"
                    />
                  </span>
                  <FormattedMessage
                    id="login.return"
                    defaultMessage={'Return to sign in by email'}
                  />
                </button>}
            </li>
          </ul>
        </div>
      </MuiThemeProvider>
    );
  }
}

Login.propTypes = {
  intl: intlShape.isRequired,
};

Login.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Login);
