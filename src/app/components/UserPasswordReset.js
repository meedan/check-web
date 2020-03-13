import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from 'material-ui/TextField';
import ResetPasswordMutation from '../relay/mutations/ResetPasswordMutation';
import PageTitle from './PageTitle';
import { stringHelper } from '../customHelpers';
import { ContentColumn } from '../styles/js/shared';

const messages = defineMessages({
  emailNotFoundContactSupport: {
    id: 'passwordReset.emailNotFoundContactSupport',
    defaultMessage: 'Sorry, this email was not found. Please contact {supportEmail} if you think this is an error.',
  },
  emailNotValid: {
    id: 'passwordReset.emailNotValid',
    defaultMessage: 'Please enter a valid email address.',
  },
  title: {
    id: 'passwordReset.title',
    defaultMessage: 'Reset password',
  },
});

class UserPasswordReset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
      submitDisabled: true,
      expiry: 0,
    };
  }

  handleGoBack = () => {
    browserHistory.goBack();
  };

  handleSignIn = () => {
    browserHistory.push('/');
  };

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

    const onSuccess = (response) => {
      // TODO Handle `success !== true`
      this.setState({ showConfirmDialog: true, expiry: response.resetPassword.expiry });
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
    const previousErrorMsg = this.props.location.state && this.props.location.state.errorMsg ?
      `${this.props.location.state.errorMsg.replace(/\.$/, '')}. ` :
      '';

    return (
      <PageTitle skipTeam prefix={this.props.intl.formatMessage(messages.title)} >
        <ContentColumn className="user-password-reset__component">
          <Card className="user-password-reset__card">
            { this.state.showConfirmDialog ? [
              <CardHeader key="usr-1" title={<FormattedMessage id="passwordReset.confirmedTitle" defaultMessage="Password reset sent" />} />,
              <CardContent key="usr-2">
                <FormattedMessage
                  id="passwordReset.confirmedText"
                  defaultMessage="We've sent you an email from {adminEmail} with instructions to reset your password. Make sure it didn't wind up in your spam mailbox. If you aren't receiving our password reset emails, contact {supportEmail}. Please note that the link in this email will expire in {expiry} hours."
                  values={{
                    adminEmail: stringHelper('ADMIN_EMAIL'),
                    supportEmail: stringHelper('SUPPORT_EMAIL'),
                    expiry: Math.floor(this.state.expiry / 3600),
                  }}
                />
              </CardContent>,
              <CardActions key="usr-3" className="user-password-reset__actions">
                <Button
                  color="primary"
                  disabled={this.state.submitDisabled}
                  onClick={this.handleSignIn}
                >
                  <FormattedMessage id="passwordReset.signIn" defaultMessage="Sign In" />
                </Button>
              </CardActions>,
            ] : [
              <CardHeader key="usr-1" title={<FormattedMessage id="passwordReset.title" defaultMessage="Reset password" />} />,
              <CardContent key="usr-2">
                {previousErrorMsg}
                <FormattedMessage id="passwordReset.text" defaultMessage="Add your address and an email will be sent with further instructions." />
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
              </CardContent>,
              <CardActions key="usr-3" className="user-password-reset__actions">
                <Button onClick={this.handleGoBack}>
                  <FormattedMessage id="passwordReset.cancel" defaultMessage="Cancel" />
                </Button>
                <Button color="primary" disabled={this.state.submitDisabled} onClick={this.handleSubmit.bind(this)}>
                  <FormattedMessage id="passwordReset.submit" defaultMessage="Reset Password" />
                </Button>
              </CardActions>,
            ]}
          </Card>
        </ContentColumn>
      </PageTitle>
    );
  }
}

UserPasswordReset.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPasswordReset);
