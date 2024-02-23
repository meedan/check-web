import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import withStyles from '@material-ui/core/styles/withStyles';
import SettingsHeader from '../team/SettingsHeader';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserConnectedAccount from '../user/UserConnectedAccount';
import { logout } from '../../redux/actions';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

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
    description: 'Dialog title for deleting a user account',
  },
  unknownError: {
    id: 'global.unknownError',
    defaultMessage: 'Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists.',
    description: 'Message displayed in error notification when an operation fails unexpectedly',
    values: {
      supportEmail: stringHelper('SUPPORT_EMAIL'),
    },
  },
});

const UserPrivacy = (props, context) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [message, setMessage] = React.useState(false);

  const handleSubmit = (subject) => {
    const email = 'privacy@meedan.com';
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRequestDeleteAccount = () => {
    const { user } = props;

    const onFailure = (transaction) => {
      const fallbackMessage = props.intl.formatMessage(messages.unknownError);
      const errorMessage = getErrorMessage(transaction, fallbackMessage);
      setMessage(errorMessage);
    };

    const onSuccess = () => {
      logout();
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation UserPrivacyDeleteCheckUserMutation($input: DeleteCheckUserInput!) {
          deleteCheckUser(input: $input) {
            success
          }
        }
      `,
      variables: {
        input: {
          id: user.dbid,
        },
      },
      onCompleted: onSuccess,
      onError: onFailure,
    });
  };

  const handleDeleteAccount = () => {
    handleRequestDeleteAccount();
    handleCloseDialog();
  };

  const { user, classes } = props;
  const { currentUser } = new CheckContext({ props, context }).getContextStore();

  if (!currentUser || !user || currentUser.dbid !== user.dbid) {
    return null;
  }

  const confirmDialog = {
    blurb: <FormattedMessage
      id="userPrivacy.deleteAccountConfirmationText"
      tagName="p"
      defaultMessage="Are you sure? This will remove your account and log you out of the app."
      description="Confirmation for the user to know what will happen when they remove their account"
    />,
  };

  const appName = mapGlobalMessage(props.intl, 'appNameHuman');

  const ppLink = (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={classes.linkStyle}
      href={stringHelper('PP_URL')}
    >
      <FormattedMessage id="userPrivacy.ppLink" defaultMessage="Privacy Policy" description="Link text for the privacy policy" />
    </a>
  );

  const { providers } = props.user;

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="userSettings.privacyTitle"
            defaultMessage="Privacy"
            description="Title for user settings area for user privacy settings"
          />
        }
      />
      <div id="user__privacy">
        <div className={`typography-subtitle2 ${classes.style}`}>
          <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" description="Page title for the user's privacy information" />
        </div>
        <p className={classes.style}>
          <FormattedMessage
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            description="Description text to tell the user why they should review the privacy policy"
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
              description="Description of what the app will do when the user requests their information"
              values={{ appName }}
            />
            <Button
              id="user-privacy__see-info"
              className={classes.buttonStyle}
              color="primary"
              onClick={handleSubmit.bind(this, 'Send information')}
            >
              <FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" description="Button text for the user to see their privacy information" />
            </Button>
          </CardContent>
        </Card>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              description="Help text to tell the user how they can request a change to their privacy settings"
              values={{ appName }}
            />
            <Button
              id="user-privacy__stop-processing"
              className={classes.buttonStyle}
              color="primary"
              onClick={handleSubmit.bind(this, 'Stop processing')}
            >
              <FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" description="Button text for the user to request a change to their privacy settings" />
            </Button>
          </CardContent>
        </Card>
        <div className={`typography-subtitle2 ${classes.style}`}>
          <FormattedMessage id="userPrivacy.connectedAccounts" defaultMessage="Connected accounts" description="Title for social accounts connected to their app account" />
        </div>
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
        <div className={`typography-subtitle2 ${classes.headerStyle}`}>
          <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" description="Page title for the user to delete their account" />
        </div>
        <Card className={classes.cardStyle}>
          <CardContent className={classes.cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.deleteAccountText"
              defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and workspace activity will become pseudonymous and remain on {appName}."
              description="Text to tell the user what will happen to their personal information when their account is removed"
              values={{ appName }}
            />
            <Button
              id="user-privacy__delete-account"
              className={classes.buttonStyle}
              color="primary"
              onClick={handleOpenDialog.bind(this)}
            >
              <FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" description="Button text for the user to delete their account" />
            </Button>
            <ConfirmDialog
              message={message}
              open={dialogOpen}
              title={props.intl.formatMessage(messages.deleteAccount)}
              blurb={confirmDialog.blurb}
              handleClose={handleCloseDialog.bind(this)}
              handleConfirm={handleDeleteAccount.bind(this)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(useStyles)(injectIntl(UserPrivacy));
