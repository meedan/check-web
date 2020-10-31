import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import withStyles from '@material-ui/core/styles/withStyles';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserConnectedAccount from '../user/UserConnectedAccount';
import { logout } from '../../redux/actions';
import DeleteCheckUserMutation from '../../relay/mutations/DeleteCheckUserMutation';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';

const useStyles = theme => ({
  linkStyle: {
    textDecoration: 'underline',
  },
  headerStyle: {
    margin: theme.spacing(2, 0),
    marginTop: theme.spacing(6),
  },
  style: {
    margin: theme.spacing(2, 0),
  },
  cardStyle: {
    margin: theme.spacing(2, 0),
  },
  cardTextStyle: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonStyle: {
    minWidth: 300,
    textAlign: 'end',
  },
});

const messages = defineMessages({
  deleteAccount: {
    id: 'UserPrivacy.deleteAccount',
    defaultMessage: 'Delete Account',
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
      message: null,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleOpenDialog() {
    this.setState({ dialogOpen: true });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleDeleteAccount() {
    this.handleRequestDeleteAccount();
    this.handleCloseDialog();
  }

  handleRequestDeleteAccount() {
    const { user } = this.props;

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
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
    const { classes } = this.props;

    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

    const confirmDialog = {
      blurb: <FormattedMessage
        id="userPrivacy.deleteAccountConfirmationText"
        defaultMessage="Are you sure? This will remove your account and log you out of the app."
      />,
    };

    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        className={classes.linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userPrivacy.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    const { providers } = this.props.user;
    providers.splice(providers.indexOf('google_oauth2'), 1);

    return (
      <div id="user__privacy">
        <h2 className={classes.style}>
          <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" />
        </h2>
        <p className={classes.style}>
          <FormattedMessage
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            values={{
              ppLink,
              appName,
            }}
          />
        </p>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.seeInformationText"
              defaultMessage="We will send you a file with the content and data you created and generated on {appName}. This can be kept for your records or transferred to another service."
              values={{ appName }}
            />
            <Button
              id="user-privacy__see-info"
              className={classes.buttonStyle}
              color="primary"
              onClick={UserPrivacy.handleSubmit.bind(this, 'Send information')}
            >
              <FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" />
            </Button>
          </CardContent>
        </Card>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              values={{ appName }}
            />
            <Button
              id="user-privacy__stop-processing"
              className={classes.buttonStyle}
              color="primary"
              onClick={UserPrivacy.handleSubmit.bind(this, 'Stop processing')}
            >
              <FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" />
            </Button>
          </CardContent>
        </Card>
        <h2 className={classes.style}>
          <FormattedMessage id="userPrivacy.connectedAccounts" defaultMessage="Connected accounts" />
        </h2>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <List>
              { providers.map(provider => (
                <UserConnectedAccount
                  provider={provider}
                  user={user}
                  key={provider.key}
                />
              ))}
            </List>
          </CardContent>
        </Card>
        <h2 className={classes.headerStyle}>
          <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" />
        </h2>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.deleteAccountText"
              defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and workspace activity will become pseudonymous and remain on {appName}."
              values={{ appName }}
            />
            <Button
              id="user-privacy__delete-account"
              className={classes.buttonStyle}
              color="primary"
              onClick={this.handleOpenDialog.bind(this)}
            >
              <FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" />
            </Button>
            <ConfirmDialog
              message={this.state.message}
              open={this.state.dialogOpen}
              title={this.props.intl.formatMessage(messages.deleteAccount)}
              blurb={confirmDialog.blurb}
              handleClose={this.handleCloseDialog.bind(this)}
              handleConfirm={this.handleDeleteAccount.bind(this)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
}

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(useStyles)(injectIntl(UserPrivacy));
