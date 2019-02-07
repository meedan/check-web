import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Card, CardText } from 'material-ui/Card';
import rtlDetect from 'rtl-detect';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { List } from 'material-ui/List';
import UserConnectedAccount from '../user/UserConnectedAccount';
import { logout } from '../../redux/actions';
import DeleteCheckUserMutation from '../../relay/mutations/DeleteCheckUserMutation';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import Message from '../Message';
import { stringHelper } from '../../customHelpers';
import { units } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const messages = defineMessages({
  deleteAccount: {
    id: 'UserPrivacy.deleteAccount',
    defaultMessage: 'Delete Account',
  },
  typeHere: {
    id: 'UserPrivacy.typeHere',
    defaultMessage: 'Type here',
  },
  confirmError: {
    id: 'UserPrivacy.confirmError',
    defaultMessage: 'You should type "confirm"',
  },
});

class UserPrivacy extends Component {
  static handleSubmit(subject) {
    const email = 'privacy@meedan.com';
    window.location.href = `mailto:${email}?subject=${subject}`;
  }

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      confirmationError: false,
      message: null,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      confirmationError: false,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      confirmationError: false,
    });
  }

  handleDeleteAccount() {
    const { value: confirmValue } = document.getElementById('delete-user-account_confirm');
    if (confirmValue && confirmValue.toUpperCase() === 'CONFIRM') {
      this.setState({ confirmationError: false });
      this.handleCloseDialog();
      this.handleRequestDeleteAccount();
    } else {
      this.setState({ confirmationError: true });
    }
  }

  handleError(json) {
    let message = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message });
  }

  handleRequestDeleteAccount() {
    const { user } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const onSuccess = () => {
      logout();
    };

    Relay.Store.commitUpdate(
      new DeleteCheckUserMutation({
        id: user.dbid,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { user } = this.props;
    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

    const linkStyle = {
      textDecoration: 'underline',
    };

    const style = {
      margin: `${units(2)} 0`,
    };

    const cardStyle = {
      margin: `${units(2)} 0`,
    };

    const cardTextStyle = {
      display: 'flex',
      alignItems: 'center',
    };

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const buttonStyle = {
      minWidth: 300,
      textAlign: direction.to,
    };

    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userPrivacy.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    const { providers } = this.props.user;

    return (
      <div id="user__privacy">
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" />
        </h2>
        <p style={style}>
          <FormattedMessage
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            values={{
              ppLink,
              appName,
            }}
          />
        </p>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.seeInformationText"
              defaultMessage="We will send you a file with the content and data you created and generated on {appName}. This can be kept for your records or transferred to another service."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__see-info"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Send information')}
            />
          </CardText>
        </Card>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__stop-processing"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Stop processing')}
            />
          </CardText>
        </Card>
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.connectedAccounts" defaultMessage="Connected accounts" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <List>
              { providers.map(provider => (
                <UserConnectedAccount
                  provider={provider}
                  user={user}
                  key={provider.key}
                />
              ))}
            </List>
          </CardText>
        </Card>
        <h2 style={Object.assign({}, style, { marginTop: units(6) })}>
          <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.deleteAccountText"
              defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and team activity will become pseudonymous and remain on {appName}."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__delete-account"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" />}
              primary
              onClick={this.handleOpenDialog.bind(this)}
            />
            <Dialog
              className="delete-account__dialog"
              open={this.state.dialogOpen}
              onClose={this.handleCloseDialog.bind(this)}
              fullWidth
            >
              <DialogTitle>{this.props.intl.formatMessage(messages.deleteAccount)}</DialogTitle>
              <DialogContent>
                <Message message={this.state.message} />
                <p>
                  <FormattedMessage
                    id="userPrivacy.deleteAccountConfirmationText"
                    defaultMessage='Are you sure? This will remove your account and log you out of the app. Type "confirm" if you want to proceed.'
                  />
                </p>
                <TextField
                  id="delete-user-account_confirm"
                  key="delete-account-confirm-input"
                  className="delete-account-confirm-input"
                  placeholder={this.props.intl.formatMessage(messages.typeHere)}
                  error={this.state.confirmationError}
                  helperText={this.state.confirmationError ? this.props.intl.formatMessage(messages.confirmError) : ''}
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <FlatButton
                  label={
                    <FormattedMessage id="deleteAccount.cancel" defaultMessage="Cancel" />
                  }
                  primary
                  onClick={this.handleCloseDialog.bind(this)}
                />,
                <RaisedButton
                  label={
                    <FormattedMessage
                      id="deleteAccount.delete"
                      defaultMessage="Delete"
                    />
                  }
                  primary
                  onClick={this.handleDeleteAccount.bind(this)}
                />
              </DialogActions>
            </Dialog>
          </CardText>
        </Card>
      </div>
    );
  }
}

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPrivacy);
