import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Message from './Message';

class LoginEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      type: 'login' // or 'register'
    };
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

  render() {
    const { state, loginEmail, registerEmail } = this.props;

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
        onClick={ this.state.type === 'register' ? registerEmail.bind(this) : loginEmail.bind(this) }
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

        <Dialog title="Sign in with e-mail" actions={actions} modal={true} open={this.state.open}>
          <Message message={state.app.failure} />
          <form name={this.state.type}>
            <span className={this.state.type === 'login' ? 'hidden' : ''}>
              <TextField hintText="Your full name" floatingLabelText="Name" fullWidth={true} name="name" className="login-name" /><br />
            </span>

            <TextField hintText="Your e-mail address" floatingLabelText="E-mail" fullWidth={true} name="email" className="login-email" /><br />

            <TextField hintText="Minimum 8 characters" floatingLabelText="Password" type="password" fullWidth={true} name="password" className="login-password" /><br />            
            
            <span className={this.state.type === 'login' ? 'hidden' : ''}>
              <TextField hintText="Same as above" floatingLabelText="Password confirmation" type="password" fullWidth={true} name="password_confirmation" className="login-password-confirmation" />
            </span>
          </form>
        </Dialog>
      </span>
    );
  }
}

export default LoginEmail;
