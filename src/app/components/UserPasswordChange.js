import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import ChangePasswordMutation from '../relay/mutations/ChangePasswordMutation';
import PageTitle from './PageTitle';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import {
  units,
  title,
  black54,
  columnWidthMedium,
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
    text-align: ${props => (props.isRtl ? 'right' : 'left')};
    width: ${units(50)} !important;
  }

  .user-password-change__logo {
    display: block;
    margin: ${units(7)} auto 0;
  }

  .user-password-change__title {
    color: ${black54};
    display: block;
    margin: ${units(1)} auto;
    font: ${title};
    font-weight: 600;
    text-align: center;
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
    defaultMessage: 'New password (minimum {min} characters)',
  },
  confirmPassword: {
    id: 'passwordChange.confirmPassword',
    defaultMessage: 'Confirm password',
  },
  unmatchingPasswords: {
    id: 'passwordChange.unmatchingPasswords',
    defaultMessage: 'Passwords didn\'t match',
  },
  unknownError: {
    id: 'passwordChange.unknownError',
    defaultMessage: 'An unknown error has occurred. Please try again and contact {supportEmail} if the error persists.',
  },
  title: {
    id: 'passwordChange.title',
    defaultMessage: 'Change password',
  },
});

// TODO: Read this from the backend.
const passwordLength = {
  min: 8,
  max: 128,
};

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
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  handleSignIn() {
    const history = this.getHistory();
    history.push('/');
  }

  handleChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleChangePasswordConfirm(e) {
    const password = this.state.password;
    const password_confirmation = e.target.value;
    const bothFilled =
      password.length >= passwordLength.min && password_confirmation.length >= passwordLength.min;
    const samePass = password === password_confirmation;
    const errorMsg = bothFilled && !samePass ?
      this.props.intl.formatMessage(messages.unmatchingPasswords) : '';
    this.setState({ password_confirmation, errorMsg, submitDisabled: !(bothFilled && samePass) });
  }

  handleSubmit(e) {
    const token = UserPasswordChange.getQueryStringValue('reset_password_token');

    const onFailure = (transaction) => {
      const error = transaction.getError();

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          this.getHistory().push({ pathname: '/check/user/password-reset', state: { errorMsg: json.error } });
          return;
        }
      } catch (ex) {
        // Do nothing.
      }

      this.setState({ errorMsg: this.props.intl.formatMessage(messages.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') }), submitDisabled: true });
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
      <PageTitle skipTeam prefix={this.props.intl.formatMessage(messages.title)} >
        <StyledPasswordChange isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
          { this.state.showConfirmDialog ?
            <Card className="user-password-change__confirm-card">
              <CardTitle title={<FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" />} />
              <CardText>
                <FormattedMessage
                  id="passwordChange.successMsg"
                  defaultMessage="You're all set. Now you can log in with your new password."
                />
              </CardText>
              <CardActions className="user-password-change__actions">
                <FlatButton
                  label={<FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" />}
                  primary
                  onClick={this.handleSignIn.bind(this)}
                />
              </CardActions>
            </Card> :
            <Card className="user-password-change__card">
              <CardText>
                <img role="presentation" src={stringHelper('LOGO_URL')} className="user-password-change__logo" />

                <span className="user-password-change__title">
                  <FormattedMessage id="passwordChange.title" defaultMessage="Change password" />
                </span>

                <div className="user-password-change__password-input">
                  <TextField
                    className="user-password-change__password-input-field"
                    id="password-change-password-input"
                    type="password"
                    hintText={this.props.intl.formatMessage(messages.newPassword, { min: passwordLength.min })}
                    onChange={this.handleChangePassword.bind(this)}
                  />
                  <br />
                  <TextField
                    className="user-password-change__password-input-field"
                    id="password-change-password-input-confirm"
                    type="password"
                    hintText={this.props.intl.formatMessage(messages.confirmPassword)}
                    onChange={this.handleChangePasswordConfirm.bind(this)}
                    errorText={this.state.errorMsg}
                  />
                  <br />
                  <RaisedButton
                    className="user-password-change__submit-button"
                    label="Change Password"
                    onClick={this.handleSubmit.bind(this)}
                    primary
                    disabled={this.state.submitDisabled}
                  />
                </div>
              </CardText>
            </Card>
          }
        </StyledPasswordChange>
      </PageTitle>
    );
  }
}

UserPasswordChange.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(UserPasswordChange);
