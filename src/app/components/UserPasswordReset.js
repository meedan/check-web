import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ResetPasswordMutation from '../relay/ResetPasswordMutation';
import CheckContext from '../CheckContext';
import config from 'config';

const messages = defineMessages({
  emailNotFoundContactSupport: {
    id: 'passwordReset.emailNotFoundContactSupport',
    defaultMessage: 'Email not found. Please contact {supportEmail} for support.',
  },
  emailNotValid: {
    id: 'passwordReset.emailNotValid',
    defaultMessage: 'Please enter a valid email address.',
  }
});

class UserPasswordReset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
      submitDisabled: true
    }
  }

  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  handleGoBack() {
    const history = this.getHistory();
    history.goBack();
  }

  handleSignIn() {
    const history = this.getHistory();
    history.push('/');
  }

  handleChange(e) {
    const value = e.target.value.trim();
    const canSubmit = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    const errorMsg = canSubmit ? '' : this.props.intl.formatMessage(messages.emailNotValid);

    this.setState({ errorMsg, email: value, submitDisabled: !canSubmit });
  }

  handleSubmit(e) {
    const that = this;

    const onFailure = (transaction) => {
      that.setState({ errorMsg: that.props.intl.formatMessage(messages.emailNotFoundContactSupport, {supportEmail: config.supportEmail}), submitDisabled: true });
    };

    const onSuccess = (response) => {
      that.setState({ showConfirmDialog: true });
    };

    if (!that.state.submitDisabled){
      Relay.Store.commitUpdate(
        new ResetPasswordMutation({
          email: this.state.email
        }),
        { onSuccess, onFailure },
      );
    }
    e.preventDefault();
  }

  render() {
    return (
      <div className="user-password-reset__component">
        <Card className="user-password-reset__card">
          { this.state.showConfirmDialog ? [
            <CardTitle title={<FormattedMessage id="passwordReset.confirmedTitle" defaultMessage="Password reset sent" />} />,
            <CardText>
              <FormattedMessage id="passwordReset.confirmedText" defaultMessage="We've sent you an email from admin@checkmedia.org with instructions to reset your password. Make sure it didn't wind up in your spam mailbox. If you aren't receiving our password reset emails, contact check@meedan.com." />
            </CardText>,
            <CardActions className="user-password-reset__actions">
              <FlatButton label={<FormattedMessage id="passwordReset.signIn" defaultMessage="Sign In"/>} primary disabled={this.state.submitDisabled} onClick={this.handleSignIn.bind(this)} />
            </CardActions>
          ] : [
            <CardTitle title={<FormattedMessage id="passwordReset.title" defaultMessage="Forgot password" />} />,
            <CardText>
              <FormattedMessage id="passwordReset.text" defaultMessage="Happens to everybody! Add your address and an email will be sent with further instructions." />
              <div className="user-password-reset__email-input">
                <TextField id="password-reset-email-input"
                    type="email"
                    floatingLabelText={<FormattedMessage id="passwordReset.email" defaultMessage="Email" />}
                    onChange={this.handleChange.bind(this)}
                    errorText={this.state.errorMsg}
                    fullWidth />
              </div>
            </CardText>,
            <CardActions className="user-password-reset__actions">
              <FlatButton label={<FormattedMessage id="passwordReset.cancel" defaultMessage="Cancel" />} onClick={this.handleGoBack.bind(this)} />
              <FlatButton label={<FormattedMessage id="passwordReset.submit" defaultMessage="Reset Password"/>} primary disabled={this.state.submitDisabled} onClick={this.handleSubmit.bind(this)} />
            </CardActions>
          ]}
        </Card>
      </div>
    );
  }
}

UserPasswordReset.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordReset);
