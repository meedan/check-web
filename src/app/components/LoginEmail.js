import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Message from './Message';
import UploadImage from './UploadImage';
import { request } from '../actions/actions';

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
      password_confirmation: ''
    };
  }

  loginEmail() {
    var that = this;
    var params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password
    };
    var failureCallback = function(message) {
          that.setState({ open: true, message: message });
        },
        successCallback = function(data) {
          that.setState({ open: false, message: null });
          Checkdesk.history.push('/');
        };
    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    var that = this,
        form = document.forms.register;
    var params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.password_confirmation,
      'api_user[image]': form.image
    };
    var failureCallback = function(message) {
          that.setState({ open: true, message: message });
        },
        successCallback = function(data) {
          that.setState({ open: false, message: null });
          Checkdesk.history.push('/');
        };
    request('post', 'users', failureCallback, successCallback, params);
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
    return true;
  }

  handleSwitchType() {
    var type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({ type: type });
  }

  onImage(file) {
    document.forms.register.image = file;
  }

  handleFieldChange(e) {
    var state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    const { state } = this.props;

    const actions = [
      <FlatButton
        id="cancel-register-or-login"
        label="Cancel"
        secondary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        id="submit-register-or-login"
        label="Submit"
        primary={true}
        onClick={ this.state.type === 'register' ? this.registerEmail.bind(this) : this.loginEmail.bind(this) }
      />,
      <FlatButton
        id="register-or-login"
        label={ this.state.type === 'register' ? 'I already have an account' : 'Create a new account' }
        primary={true}
        onClick={this.handleSwitchType.bind(this)}
      />
    ];

    return (
      <span className='login-email'>
        <a id="login-email" onClick={this.handleOpen.bind(this)} className='login-email__link'>Sign in with e-mail</a>

        <Dialog title="Sign in with e-mail" actions={actions} modal={true} open={this.state.open} autoScrollBodyContent={true} autoDetectWindowHeight={true}>
          <Message message={this.state.message} />
          <form name={this.state.type}>
            <span className={this.state.type === 'login' ? 'hidden' : ''}>
              <TextField hintText="Your full name" floatingLabelText="Name" fullWidth={true} name="name" className="login-name" value={this.state.name} onChange={this.handleFieldChange.bind(this)} /><br />
            </span>

            <TextField hintText="Your e-mail address" floatingLabelText="E-mail" fullWidth={true} name="email" className="login-email" value={this.state.email} onChange={this.handleFieldChange.bind(this)} /><br />

            <TextField hintText="Minimum 8 characters" floatingLabelText="Password" type="password" fullWidth={true} name="password" className="login-password" value={this.state.password} onChange={this.handleFieldChange.bind(this)} /><br />

            {this.state.type === 'login' ? (<p className='login-email__help-text'>Having trouble logging in? Please email check@meedan.com for assistance.</p>) : null}

            <span className={this.state.type === 'login' ? 'hidden' : ''}>
              <TextField hintText="Same as above" floatingLabelText="Password confirmation" type="password" fullWidth={true} name="password_confirmation" className="login-password-confirmation" value={this.state.password_confirmation} onChange={this.handleFieldChange.bind(this)} />
              <UploadImage onImage={this.onImage.bind(this)} />
            </span>
          </form>
        </Dialog>
      </span>
    );
  }
}

export default LoginEmail;
