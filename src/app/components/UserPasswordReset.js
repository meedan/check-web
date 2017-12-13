import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ResetPasswordMutation from '../relay/mutations/ResetPasswordMutation';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import { ContentColumn } from '../styles/js/shared';

const messages = defineMessages({
  emailNotFoundContactSupport: {
    id: 'passwordReset.emailNotFoundContactSupport',
    defaultMessage: 'Email not found. Please contact {supportEmail} for support.',
  },
  emailNotValid: {
    id: 'passwordReset.emailNotValid',
    defaultMessage: 'Please enter a valid email address.',
  },
});

class UserPasswordReset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
      submitDisabled: true,
    };
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
    const canSubmit = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    const errorMsg = canSubmit ? '' : this.props.intl.formatMessage(messages.emailNotValid);

    this.setState({ errorMsg, email: value, submitDisabled: !canSubmit });
  }

  handleSubmit(e) {
    const onFailure = () => {
      this.setState({ errorMsg: this.props.intl.formatMessage(messages.emailNotFoundContactSupport, { supportEmail: stringHelper('SUPPORT_EMAIL') }), submitDisabled: true });
    };

    const onSuccess = () => {
      this.setState({ showConfirmDialog: true });
    };

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new ResetPasswordMutation({
          email: this.state.email,
        }),
        { onSuccess, onFailure },
      );
    }
    e.preventDefault();
  }

  render() {
    return (
      <ContentColumn className="user-password-reset__component">
        <Card className="user-password-reset__card">
          { this.state.showConfirmDialog ? [
            <CardTitle title={<FormattedMessage id="passwordReset.confirmedTitle" defaultMessage="Password reset sent" />} />,
            <CardText>
              <FormattedMessage
                id="passwordReset.confirmedText"
                defaultMessage="We've sent you an email from {adminEmail} with instructions to reset your password. Make sure it didn't wind up in your spam mailbox. If you aren't receiving our password reset emails, contact {supportEmail}."
                values={{ adminEmail: stringHelper('ADMIN_EMAIL'), supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </CardText>,
            <CardActions className="user-password-reset__actions">
              <FlatButton label={<FormattedMessage id="passwordReset.signIn" defaultMessage="Sign In" />} primary disabled={this.state.submitDisabled} onClick={this.handleSignIn.bind(this)} />
            </CardActions>,
          ] : [
            <CardTitle title={<FormattedMessage id="passwordReset.title" defaultMessage="Forgot password" />} />,
            <CardText>
              <FormattedMessage id="passwordReset.text" defaultMessage="Happens to everybody! Add your address and an email will be sent with further instructions." />
              <div className="user-password-reset__email-input">
                <TextField
                  id="password-reset-email-input"
                  type="email"
                  floatingLabelText={<FormattedMessage id="passwordReset.email" defaultMessage="Email" />}
                  onChange={this.handleChange.bind(this)}
                  errorText={this.state.errorMsg}
                  fullWidth
                  autoFocus
                />
              </div>
            </CardText>,
            <CardActions className="user-password-reset__actions">
              <FlatButton label={<FormattedMessage id="passwordReset.cancel" defaultMessage="Cancel" />} onClick={this.handleGoBack.bind(this)} />
              <FlatButton label={<FormattedMessage id="passwordReset.submit" defaultMessage="Reset Password" />} primary disabled={this.state.submitDisabled} onClick={this.handleSubmit.bind(this)} />
            </CardActions>,
          ]}
        </Card>
      </ContentColumn>
    );
  }
}

UserPasswordReset.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordReset);
