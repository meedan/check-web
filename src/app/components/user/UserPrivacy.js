import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsHeader from '../team/SettingsHeader';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserConnectedAccount from '../user/UserConnectedAccount';
import { logout } from '../../redux/actions';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import styles from './user.module.css';

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

  const { user } = props;
  const { currentUser } = new CheckContext({ props, context }).getContextStore();

  if (!currentUser || !user || currentUser.dbid !== user.dbid) {
    return null;
  }

  const confirmDialog = {
    blurb: <FormattedMessage
      defaultMessage="Are you sure? This will remove your account and log you out of the app."
      description="Confirmation for the user to know what will happen when they remove their account"
      id="userPrivacy.deleteAccountConfirmationText"
      tagName="p"
    />,
  };

  const appName = mapGlobalMessage(props.intl, 'appNameHuman');

  const ppLink = (
    <a
      href={stringHelper('PP_URL')}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FormattedMessage defaultMessage="Privacy Policy" description="Link text for the privacy policy" id="userPrivacy.ppLink" />
    </a>
  );

  const { providers } = props.user;

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            defaultMessage="Privacy"
            description="Title for user settings area for user privacy settings"
            id="userSettings.privacyTitle"
          />
        }
      />
      <div className={styles['user-setting-details-wrapper']} id="user__privacy">
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Your information" description="Page title for the user's privacy information" id="userPrivacy.title" />
          </div>
          <FormattedMessage
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            description="Description text to tell the user why they should review the privacy policy"
            id="userPrivacy.description"
            tagName="p"
            values={{
              ppLink,
              appName,
            }}
          />
          <div className={styles['user-setting-content-container-inner']}>
            <FormattedMessage defaultMessage="User Information Requests" description="Title for area instructing how to request data from Check" id="userPrivacy.userRequests" tagName="strong" />
            <br />
            <ul className="bulleted-list">
              <FormattedHTMLMessage
                defaultMessage='Request a file with the content and data you created and generated on {appName} by contacting <a href="mailto:{privacyEmail}?subject=Send information">{privacyEmail}</a>.'
                description="Description of what the app will do when the user requests their information"
                id="userPrivacy.seeInformationText"
                tagName="li"
                values={{
                  appName,
                  privacyEmail: stringHelper('PRIVACY_EMAIL'),
                }}
              />
              <FormattedHTMLMessage
                defaultMessage='Request {appName} to stop processing your information under certain conditions by contacting <a href="mailto:{privacyEmail}?subject=Stop processing">{privacyEmail}</a>.'
                description="Help text to tell the user how they can request a change to their privacy settings"
                id="userPrivacy.stopProcessingText"
                tagName="li"
                values={{
                  appName,
                  privacyEmail: stringHelper('PRIVACY_EMAIL'),
                }}
              />
            </ul>
          </div>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Connected accounts" description="Title for social accounts connected to their app account" id="userPrivacy.connectedAccounts" />
          </div>
          <ul className={styles['user-setting-content-list']}>
            { providers.map(provider => (
              <UserConnectedAccount
                key={provider.key}
                provider={provider}
                user={user}
              />
            ))}
          </ul>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage defaultMessage="Delete your account" description="Page title for the user to delete their account" id="userPrivacy.delete" />
          </div>
          <FormattedMessage
            defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and workspace activity will become pseudonymous and remain on {appName}."
            description="Text to tell the user what will happen to their personal information when their account is removed"
            id="userPrivacy.deleteAccountText"
            tagName="p"
            values={{ appName }}
          />
          <ButtonMain
            buttonProps={{
              id: 'user-privacy__delete-account',
            }}
            label={
              <FormattedMessage defaultMessage="Delete my account" description="Button text for the user to delete their account" id="userPrivacy.deleteAccountButton" />
            }
            size="default"
            theme="lightError"
            variant="contained"
            onClick={handleOpenDialog.bind(this)}
          />
          <ConfirmDialog
            blurb={confirmDialog.blurb}
            handleClose={handleCloseDialog.bind(this)}
            handleConfirm={handleDeleteAccount.bind(this)}
            message={message}
            open={dialogOpen}
            title={props.intl.formatMessage(messages.deleteAccount)}
          />
        </div>
      </div>
    </>
  );
};

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPrivacy);
