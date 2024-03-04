import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
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
import styles from '../source/User.module.css';

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

  const { user } = props;
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
      <div id="user__privacy" className={styles['user-setting-details-wrapper']}>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" description="Page title for the user's privacy information" />
          </div>
          <FormattedMessage
            tagName="p"
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            description="Description text to tell the user why they should review the privacy policy"
            values={{
              ppLink,
              appName,
            }}
          />
          <div className={styles['user-setting-content-container-inner']}>
            <FormattedMessage
              tagName="p"
              id="userPrivacy.seeInformationText"
              defaultMessage="We will send you a file with the content and data you created and generated on {appName}. This can be kept for your records or transferred to another service."
              description="Description of what the app will do when the user requests their information"
              values={{ appName }}
            />
            <ButtonMain
              buttonProps={{
                id: 'user-privacy__see-info',
              }}
              size="default"
              variant="contained"
              theme="brand"
              onClick={handleSubmit.bind(this, 'Send information')}
              label={
                <FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" description="Button text for the user to see their privacy information" />
              }
            />
          </div>
          <div className={styles['user-setting-content-container-inner']}>
            <FormattedMessage
              tagName="p"
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              description="Help text to tell the user how they can request a change to their privacy settings"
              values={{ appName }}
            />
            <ButtonMain
              buttonProps={{
                id: 'user-privacy__stop-processing',
              }}
              size="default"
              variant="contained"
              theme="brand"
              onClick={handleSubmit.bind(this, 'Stop processing')}
              label={
                <FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" description="Button text for the user to request a change to their privacy settings" />
              }
            />
          </div>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage id="userPrivacy.connectedAccounts" defaultMessage="Connected accounts" description="Title for social accounts connected to their app account" />
          </div>
          <ul className={styles['user-setting-content-list']}>
            { providers.map(provider => (
              <UserConnectedAccount
                provider={provider}
                user={user}
                key={provider.key}
              />
            ))}
          </ul>
        </div>
        <div className={styles['user-setting-content-container']}>
          <div className={styles['user-setting-content-container-title']}>
            <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" description="Page title for the user to delete their account" />
          </div>
          <FormattedMessage
            tagName="p"
            id="userPrivacy.deleteAccountText"
            defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and workspace activity will become pseudonymous and remain on {appName}."
            description="Text to tell the user what will happen to their personal information when their account is removed"
            values={{ appName }}
          />
          <ButtonMain
            buttonProps={{
              id: 'user-privacy__delete-account',
            }}
            size="default"
            variant="contained"
            theme="lightError"
            onClick={handleOpenDialog.bind(this)}
            label={
              <FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" description="Button text for the user to delete their account" />
            }
          />
          <ConfirmDialog
            message={message}
            open={dialogOpen}
            title={props.intl.formatMessage(messages.deleteAccount)}
            blurb={confirmDialog.blurb}
            handleClose={handleCloseDialog.bind(this)}
            handleConfirm={handleDeleteAccount.bind(this)}
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
