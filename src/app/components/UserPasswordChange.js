import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import ChangePasswordMutation from '../relay/ChangePasswordMutation';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import {
  columnWidthMedium,
  units,
  alertRed,
  black54,
} from '../styles/js/shared';

const StyledPasswordChange = styled.div`
  .user-password-change__card {
    margin: ${units(9)} auto auto;
    max-width: ${columnWidthMedium};
    text-align: center;
  }

  .user-password-change__confirm-card {
    margin: ${units(10)} auto auto;
    max-width: ${columnWidthMedium};
  }

  .user-password-change__password-input-field {
    margin-top: ${units(1)};
  }

  .user-password-change__logo {
    display: block;
    margin: ${units(7)} auto 0;
  }

  .user-password-change__error {
    color: ${alertRed};
    display: block;
    margin: ${units(1)} auto;
  }

  .user-password-change__title {
    color: ${black54};
    display: block;
    font: font(title);
    margin: ${units(1)} auto;
  }

  .user-password-change__submit-button {
    margin-bottom: ${units(6)};
    margin-top: ${units(3)};
  }

  .user-password-change__actions {
    text-align: ${props => (props.isRtl ? 'left' : 'right')};
  }

`;

const messages = defineMessages({
  newPassword: {
    id: 'passwordChange.newPassword',
    defaultMessage: 'New password',
  },
  confirmPassword: {
    id: 'passwordChange.confirmPassword',
    defaultMessage: 'Confirm password',
  },
  unmatchingPasswords: {
    id: 'passwordChange.unmatchingPasswords',
    defaultMessage: "Passwords didn't match",
  },
});

class UserPasswordChange extends Component {
  static getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
  }

  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
      submitDisabled: true,
    };
  }

  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleSignIn() {
    this.getHistory().push('/check/login/email');
  }

  handleChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleChangePasswordConfirm(e) {
    this.setState({ password_confirmation: e.target.value }, this.canSubmit);
  }

  canSubmit() {
    const password = this.state.password;
    const password_confirmation = this.state.password_confirmation;
    const bothFilled = (!!password && !!password_confirmation);
    const sameSize = (password.length <= password_confirmation.length);
    const samePass = (password === password_confirmation);

    let errorMsg = '';

    if (bothFilled) {
      errorMsg = sameSize && !samePass ? this.props.intl.formatMessage(messages.unmatchingPasswords) : '';
    }

    this.setState({ errorMsg, submitDisabled: !samePass });
  }

  handleSubmit(e) {
    const token = this.getQueryStringValue('reset_password_token');

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = '';

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
          const matches = message.match(/match/);

          if (matches) {
            message = this.props.intl.formatMessage(messages.unmatchingPasswords);
            this.setState({ password: '', password_confirmation: '' });
          }
        }
      } catch (ex) {
        // Do nothing.
      }

      this.setState({ errorMsg: message, submitDisabled: true });
    };

    const onSuccess = () => {
      this.setState({ showConfirmDialog: true });
    };

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new ChangePasswordMutation({
          reset_password_token: token,
          password: this.state.password,
          password_confirmation: this.state.password_confirmation,
        }),
        { onSuccess, onFailure },
      );
    }
    e.preventDefault();
  }

  render() {
    return (
      <StyledPasswordChange isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
        { this.state.showConfirmDialog ?
          <Card className="user-password-change__confirm-card">
            <CardTitle title={<FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" />} />
            <CardText>
              <FormattedMessage id="passwordChange.successMsg" defaultMessage="You're all set. Now you can log in with your new password." />
            </CardText>
            <CardActions className="user-password-change__actions">
              <FlatButton label={<FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" />} primary onClick={this.handleSignIn.bind(this)} />
            </CardActions>
          </Card> :
          <Card className="user-password-change__card">
            <CardText>
              <img role="presentation" src={stringHelper('LOGO_URL')} className="user-password-change__logo" />

              <span className="user-password-change__title"><FormattedMessage id="passwordChange.title" defaultMessage="Change password" /></span>
              <span className="user-password-change__error">{this.state.errorMsg}</span>

              <div className="user-password-change__password-input">
                <TextField
                  className="user-password-change__password-input-field"
                  id="password-change-password-input"
                  type="password"
                  placeholder={this.props.intl.formatMessage(messages.newPassword)}
                  onChange={this.handleChangePassword.bind(this)}
                />
                <br />
                <TextField
                  className="user-password-change__password-input-field"
                  id="password-change-password-input-confirm"
                  type="password"
                  placeholder={this.props.intl.formatMessage(messages.confirmPassword)}
                  onChange={this.handleChangePasswordConfirm.bind(this)}
                />
                <br />
                <RaisedButton className="user-password-change__submit-button" label="Change Password" onClick={this.handleSubmit.bind(this)} primary disabled={this.state.submitDisabled} />
              </div>
            </CardText>
          </Card>
        }
      </StyledPasswordChange>
    );
  }
}

UserPasswordChange.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordChange);
