import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Card, CardText, CardActions, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import rtlDetect from 'rtl-detect';
import PageTitle from './PageTitle';
import ChangePasswordComponent from './ChangePasswordComponent';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import { StyledPasswordChange } from '../styles/js/shared';

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
  title: {
    id: 'passwordChange.title',
    defaultMessage: 'Change password',
  },
});

class UserPasswordChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirmDialog: false,
    };
  }

  static getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
  }

  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleSignIn() {
    this.getHistory().push('/');
  }

  showConfirm() {
    this.setState({ showConfirmDialog: true });
  }

  render() {
    const token = UserPasswordChange.getQueryStringValue('reset_password_token');
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
                <img alt="" src={stringHelper('LOGO_URL')} className="user-password-change__logo" />

                <span className="user-password-change__title">
                  <FormattedMessage id="passwordChange.title" defaultMessage="Change password" />
                </span>

                <ChangePasswordComponent
                  type="reset-password"
                  show_current_password={false}
                  token={token}
                  show_confirm={this.showConfirm.bind(this)}
                />
              </CardText>
            </Card>
          }
        </StyledPasswordChange>
      </PageTitle>
    );
  }
}

UserPasswordChange.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPasswordChange);
