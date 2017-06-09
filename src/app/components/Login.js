import React, {Component, PropTypes} from 'react';
import {
  FormattedHTMLMessage,
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import Message from './Message';
import UploadImage from './UploadImage';
import CheckContext from '../CheckContext';
import {request} from '../actions/actions';
import {Link} from 'react-router';
import {login} from '../actions/actions';
import FASlack from 'react-icons/lib/fa/slack';
import FAFacebook from 'react-icons/lib/fa/facebook-official';
import FATwitter from 'react-icons/lib/fa/twitter';
import MDEmail from 'react-icons/lib/md/email';
import { stringHelper } from '../customHelpers';

const messages = defineMessages({
  nameInputHint: {
    id: 'login.nameInputHint',
    defaultMessage: 'Your name',
  },
  emailInputHint: {
    id: 'login.emailInputHint',
    defaultMessage: 'Email address',
  },
  passwordInputHint: {
    id: 'login.passwordInputHint',
    defaultMessage: 'Password',
  },
  passwordConfirmInputHint: {
    id: 'login.passwordConfirmInputHint',
    defaultMessage: 'Password confirmation',
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

  onFormSubmit(e) {
    e.preventDefault();

    if (this.state.type === 'login') {
      this.emailLogin();
    } else {
      this.registerEmail();
    }
  }

  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  oAuthLogin(provider) {
    login(provider, this.props.loginCallback);
  }

  emailLogin() {
    const history = this.getHistory();
    const that = this;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
    };
    let failureCallback = function(message) {
      that.setState({message});
    },
      successCallback = function(data) {
        that.setState({message: null});
        that.props.loginCallback();
        history.push('/');
      };
    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    const history = this.getHistory();
    let that = this, form = document.forms.register;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.password_confirmation,
      'api_user[image]': form.image,
    };
    let failureCallback = function(message) {
      that.setState({message});
    },
      successCallback = function(data) {
        that.setState({message: null});
        that.props.loginCallback();
        history.push(window.location.pathname);
      };
    request('post', 'users', failureCallback, successCallback, params);
  }

  focusFirstInput() {
    const input = document.querySelector('.login input');
    if (input) {
      input.focus();
    }
  }

  handleSwitchType() {
    const type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({type}, function() {
      this.focusFirstInput();
    });
  }

  componentDidMount() {
    this.focusFirstInput();
  }

  onImage(file) {
    document.forms.register.image = file;
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  render() {
    const {state} = this.props;

    return (
      <div className="login" id="login">
        <form
          name={this.state.type}
          onSubmit={this.onFormSubmit.bind(this)}
          className="login__form">
          <img alt="Check" width="120" className="login__icon" src={stringHelper('LOGO_URL')} />
          <h2 className="login__heading">
            {this.state.type === 'login'
              ? <FormattedMessage id="login.title" defaultMessage="Sign in" />
              : <FormattedMessage id="login.registerTitle" defaultMessage="Register" />}
          </h2>
          <Message message={this.state.message} />
          {this.state.type === 'login'
            ? null
            : <div className="login__name">
                <input
                  type="text"
                  name="name"
                  value={this.state.name}
                  className="login__name-input"
                  onChange={this.handleFieldChange.bind(this)}
                  placeholder={this.props.intl.formatMessage(messages.nameInputHint)}
                />
                <label
                  className={this.bemClass(
                    'login__name-label',
                    !!this.state.name,
                    '--text-entered'
                  )}>
                  <FormattedMessage id="login.nameLabel" defaultMessage="Your name" />
                </label>
              </div>}

          <div className="login__email">
            <input
              type="email"
              name="email"
              value={this.state.email}
              className="login__email-input"
              onChange={this.handleFieldChange.bind(this)}
              placeholder={this.props.intl.formatMessage(messages.emailInputHint)}
            />
            <label
              className={this.bemClass('login__email-label', !!this.state.email, '--text-entered')}>
              <FormattedMessage id="login.emailLabel" defaultMessage="Email address" />
            </label>
          </div>

          <div className="login__password">
            <input
              type="password"
              name="password"
              value={this.state.password}
              className="login__password-input"
              onChange={this.handleFieldChange.bind(this)}
              placeholder={this.props.intl.formatMessage(messages.passwordInputHint)}
            />
            <label
              className={this.bemClass(
                'login__password-label',
                !!this.state.password,
                '--text-entered'
              )}>
              <FormattedMessage
                id="login.passwordLabel"
                defaultMessage="Password (minimum 8 characters)"
              />
            </label>
          </div>

          {this.state.type === 'login'
            ? null
            : <div className="login__password-confirmation">
                <input
                  type="password"
                  name="password_confirmation"
                  value={this.state.password_confirmation}
                  className="login__password-confirmation-input"
                  onChange={this.handleFieldChange.bind(this)}
                  placeholder={this.props.intl.formatMessage(messages.passwordConfirmInputHint)}
                />
                <label
                  className={this.bemClass(
                    'login__password-confirmation-label',
                    !!this.state.password_confirmation,
                    '--text-entered'
                  )}>
                  <FormattedMessage
                    id="login.passwordConfirmLabel"
                    defaultMessage="Password confirmation"
                  />
                </label>
              </div>}

          {this.state.type === 'login' ? null : <UploadImage onImage={this.onImage.bind(this)} />}

          <div className="login__actions">
            <button
              type="submit"
              id="submit-register-or-login"
              className={`login__submit login__submit--${this.state.type}`}>
              {this.state.type === 'login'
                ? <FormattedMessage id="login.signIn" defaultMessage="SIGN IN" />
                : <FormattedMessage id="login.signUp" defaultMessage="REGISTER" />}
            </button>

            {this.state.type === 'login'
              ? <span className="login__forgot-password">
                  <Link to="/check/user/password-reset">
                    <FormattedMessage
                      id="loginEmail.lostPassword"
                      defaultMessage="Forgot password"
                    />
                  </Link>
                </span>
              : null}

          </div>
        </form>
        <ul className="login__oauth-list">
          <li>
            <button
              onClick={this.oAuthLogin.bind(this, 'slack')}
              id="slack-login"
              className="login__button login__button--slack">
              <span className="login__link">
                <FASlack />
                <FormattedMessage
                  id="login.with"
                  defaultMessage={'Continue with {provider}'}
                  values={{provider: 'Slack'}}
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
              className="login__button login__button--twitter">
              <span className="login__link">
                <FATwitter />
                <FormattedMessage
                  id="login.with"
                  defaultMessage={'Continue with {provider}'}
                  values={{provider: 'Twitter'}}
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
              className="login__button login__button--facebook">
              <span className="login__link">
                <FAFacebook />
                <FormattedMessage
                  id="login.with"
                  defaultMessage={'Continue with {provider}'}
                  values={{provider: 'Facebook'}}
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
                  className="login__button login__button--email">
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
                  className="login__button login__button--email">
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
