import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import rtlDetect from 'rtl-detect';
import PageTitle from './PageTitle';
import ChangePasswordComponent from './ChangePasswordComponent';
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

function handleSignIn() {
  browserHistory.push('/');
}

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
              <CardHeader title={<FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" />} />
              <CardContent>
                <FormattedMessage
                  id="passwordChange.successMsg"
                  defaultMessage="You're all set. Now you can log in with your new password."
                />
              </CardContent>
              <CardActions className="user-password-change__actions">
                <Button color="primary" onClick={handleSignIn}>
                  <FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" />
                </Button>
              </CardActions>
            </Card> :
            <Card className="user-password-change__card">
              <CardContent>
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
              </CardContent>
            </Card>
          }
        </StyledPasswordChange>
      </PageTitle>
    );
  }
}

export default injectIntl(UserPasswordChange);
