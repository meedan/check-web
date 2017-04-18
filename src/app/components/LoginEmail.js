import React, { Component, PropTypes } from 'react';
import { FormattedHTMLMessage, FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Message from './Message';
import UploadImage from './UploadImage';
import CheckContext from '../CheckContext';
import { request } from '../actions/actions';
import { Link } from 'react-router';

const messages = defineMessages({
  nameInputHint: {
    id: 'loginEmail.nameInputHint',
    defaultMessage: 'Your name',
  },
  emailInputHint: {
    id: 'loginEmail.emailInputHint',
    defaultMessage: 'Email address',
  },
  passwordInputHint: {
    id: 'loginEmail.passwordInputHint',
    defaultMessage: 'Password',
  },
  passwordConfirmInputHint: {
    id: 'loginEmail.passwordConfirmInputHint',
    defaultMessage: 'Password confirmation',
  },
});

class LoginEmail extends Component {
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
      this.loginEmail();
    } else {
      this.registerEmail();
    }
  }

  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  loginEmail() {
    const history = this.getHistory();
    const that = this;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
    };
    let failureCallback = function (message) {
        that.setState({ open: true, message });
      },
      successCallback = function (data) {
        that.setState({ open: false, message: null });
        that.props.loginCallback();
        history.push('/');
      };
    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    const history = this.getHistory();
    let that = this,
      form = document.forms.register;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.password_confirmation,
      'api_user[image]': form.image,
    };
    let failureCallback = function (message) {
        that.setState({ message });
      },
      successCallback = function (data) {
        that.setState({ message: null });
        that.props.loginCallback();
        history.push(window.location.pathname);
      };
    request('post', 'users', failureCallback, successCallback, params);
  }

  focusFirstInput() {
    const input = document.querySelector('.login-email input');
    if (input) {
      input.focus();
    }
  }

  handleSwitchType() {
    const type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({ type }, function () {
      this.focusFirstInput();
    });
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
    const { state } = this.props;

    return (
      <span className="login-email">
        <section>

          <Message message={this.state.message} />

          <form name={this.state.type} onSubmit={this.onFormSubmit.bind(this)} className="login-email__form">
            {this.state.type === 'login' ? null : (
              <div className="login-email__name">
                <input type="text" name="name" value={this.state.name} className="login-email__name-input" onChange={this.handleFieldChange.bind(this)} placeholder={this.props.intl.formatMessage(messages.nameInputHint)} />
                <label className={this.bemClass('login-email__name-label', !!this.state.name, '--text-entered')}><FormattedMessage id="loginEmail.nameLabel" defaultMessage="Your name" /></label>
              </div>
            )}

            <div className="login-email__email">
              <input type="email" name="email" value={this.state.email} className="login-email__email-input" onChange={this.handleFieldChange.bind(this)} placeholder={this.props.intl.formatMessage(messages.emailInputHint)} />
              <label className={this.bemClass('login-email__email-label', !!this.state.email, '--text-entered')}><FormattedMessage id="loginEmail.emailLabel" defaultMessage="Email address" /></label>
            </div>

            <div className="login-email__password">
              <input type="password" name="password" value={this.state.password} className="login-email__password-input" onChange={this.handleFieldChange.bind(this)} placeholder={this.props.intl.formatMessage(messages.passwordInputHint)} />
              <label className={this.bemClass('login-email__password-label', !!this.state.password, '--text-entered')}><FormattedMessage id="loginEmail.passwordLabel" defaultMessage="Password (minimum 8 characters)" /></label>
            </div>

            {/* Registration form only */}
            {this.state.type === 'login' ? null : (
              <div className="login-email__password-confirmation">
                <input type="password" name="password_confirmation" value={this.state.password_confirmation} className="login-email__password-confirmation-input" onChange={this.handleFieldChange.bind(this)} placeholder={this.props.intl.formatMessage(messages.passwordConfirmInputHint)} />
                <label className={this.bemClass('login-email__password-confirmation-label', !!this.state.password_confirmation, '--text-entered')}><FormattedMessage id="loginEmail.passwordConfirmLabel" defaultMessage="Password confirmation" /></label>
              </div>
            )}

            {/* Registration form only */}
            {this.state.type === 'login' ? null : (
              <UploadImage onImage={this.onImage.bind(this)} />
            )}

            <div className="login-email__actions">
              <button type="submit" id="submit-register-or-login" className={`login-email__submit login-email__submit--${this.state.type}`}>
                {this.state.type === 'login' ? <FormattedMessage id="loginEmail.signIn" defaultMessage="Sign in »" /> : <FormattedMessage id="loginEmail.signUp" defaultMessage="Sign up »" />}
              </button>
              {this.state.type === 'login' ? <span className="login-email__forgot-password"><Link to="/check/user/password-reset"><FormattedMessage id="loginEmail.lostPassword" defaultMessage="Forgot password?"></FormattedMessage></Link></span> : null }
              <button type="button" id="register-or-login" onClick={this.handleSwitchType.bind(this)} className="login-email__register-or-login">
                {this.state.type === 'register' ? <FormattedMessage id="loginEmail.alreadyHasAccount" defaultMessage="I already have an account" /> : <FormattedMessage id="loginEmail.newAccount" defaultMessage="Create a new account" />}
              </button>
            </div>
          </form>
        </section>
      </span>
    );
  }
}

LoginEmail.propTypes = {
  intl: intlShape.isRequired,
};

LoginEmail.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(LoginEmail);
