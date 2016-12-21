import React, { Component, PropTypes } from 'react';
import Message from './Message';
import UploadImage from './UploadImage';
import CheckContext from '../CheckContext';
import { request } from '../actions/actions';
import { Link } from 'react-router';

class LoginEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
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
      'api_user[password]': this.state.password
    };
    let failureCallback = function (message) {
      that.setState({ open: true, message: message });
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
      'api_user[image]': form.image
    };
    let failureCallback = function (message) {
      that.setState({ open: true, message: message });
    },
    successCallback = function (data) {
      that.setState({ open: false, message: null });
      that.props.loginCallback();
      history.push(window.location.pathname);
    };
    request('post', 'users', failureCallback, successCallback, params);
  }

  handleOpen() {
    this.setState({ open: true }, function () {
      this.focusFirstInput();
    });
  }

  focusFirstInput() {
    const input = document.querySelector('.login-email input');
    if (input) {
      input.focus();
    }
  }

  handleClose() {
    this.setState({ open: false });
    return true;
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
        <a id="login-email" onClick={this.handleOpen.bind(this)} className="login-email__link">Sign in with e-mail</a>

        <section className={this.bemClass('login-email__modal', this.state.open, '--open')}>
          <Message message={this.state.message} />
          <form name={this.state.type} onSubmit={this.onFormSubmit.bind(this)} className="login-email__form">
            {this.state.type === 'login' ? null : (
              <div className="login-email__name">
                <input type="text" name="name" value={this.state.name} className="login-email__name-input" onChange={this.handleFieldChange.bind(this)} placeholder="Your name" />
                <label className={this.bemClass('login-email__name-label', !!this.state.name, '--text-entered')}>Your name</label>
              </div>
            )}

            <div className="login-email__email">
              <input type="email" name="email" value={this.state.email} className="login-email__email-input" onChange={this.handleFieldChange.bind(this)} placeholder="Email address" />
              <label className={this.bemClass('login-email__email-label', !!this.state.email, '--text-entered')}>Email address</label>
            </div>

            <div className="login-email__password">
              <input type="password" name="password" value={this.state.password} className="login-email__password-input" onChange={this.handleFieldChange.bind(this)} placeholder="Password" />
              <label className={this.bemClass('login-email__password-label', !!this.state.password, '--text-entered')}>Password (minimum 8 characters)</label>
            </div>

            {this.state.type === 'login' ? null : (
              <div className="login-email__password-confirmation">
                <input type="password" name="password_confirmation" value={this.state.password_confirmation} className="login-email__password-confirmation-input" onChange={this.handleFieldChange.bind(this)} placeholder="Password confirmation" />
                <label className={this.bemClass('login-email__password-confirmation-label', !!this.state.password_confirmation, '--text-entered')}>Password confirmation</label>
              </div>
            )}

            {this.state.type === 'login' ? null : (
              <UploadImage onImage={this.onImage.bind(this)} />
            )}

            <div className="login-email__actions">
              <button type="submit" id="submit-register-or-login" onClick={this.onFormSubmit.bind(this)} className={`login-email__submit login-email__submit--${this.state.type}`}>
                {this.state.type === 'login' ? 'Sign in »' : 'Sign up »'}
              </button>
              <button type="button" id="register-or-login" onClick={this.handleSwitchType.bind(this)} className="login-email__register-or-login">
                {this.state.type === 'register' ? 'I already have an account' : 'Create a new account'}
              </button>
              <button type="button" id="cancel-register-or-login" onClick={this.handleClose.bind(this)} className="login-email__cancel">Sign in with Twitter, Facebook, or Slack</button>
            </div>
          </form>
          {this.state.type === 'login' ? (<p className="login-email__help-text">Having trouble logging in? Please email <Link to="mailto:check@meedan.com">check@meedan.com</Link> for&nbsp;assistance.</p>) : null}
        </section>
      </span>
    );
  }
}

LoginEmail.contextTypes = {
  store: React.PropTypes.object
};

export default LoginEmail;
