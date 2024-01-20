import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import ConfirmEmail from './ConfirmEmail';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { updateUserNameEmail } from '../../relay/mutations/UpdateUserNameEmailMutation';
import styles from './user.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const messages = defineMessages({
  emailHint: {
    id: 'userEmail.emailInputHint',
    defaultMessage: 'email@example.com',
    description: 'Text field input help text about the format of an email address',
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

class UserEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  handleClickSkip = () => {
    window.storage.set('dismiss-user-email-nudge', '1');
    this.forceUpdate();
  };

  handleSubmit = () => {
    const email = document.getElementById('user-email__input').value;

    const onSuccess = () => {
      this.setState({ message: null });
      document.getElementById('user-email__input').value = '';
    };

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.unknownError);
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
    };

    if (email) {
      updateUserNameEmail(
        this.props.user.id,
        this.props.user.name,
        email,
        true,
        onSuccess, onFailure,
      );
    }
  };

  render() {
    const { currentUser } = new CheckContext(this).getContextStore();

    if ((currentUser && currentUser.dbid) !== this.props.user.dbid) {
      return null;
    }

    if (this.props.user.unconfirmed_email) {
      return <><ConfirmEmail user={this.props.user} /><br /></>;
    } else if (!this.props.user.email && window.storage.getValue('dismiss-user-email-nudge') !== '1') {
      return (
        <div className={styles['user-email']}>
          <Alert
            variant="warning"
            title={<FormattedMessage id="userEmail.alertTitle" defaultMessage="Add your email" description="Alert title for prompting the user to add their email address in order to receive notifications" />}
            content={
              <FormattedMessage
                id="userEmail.text"
                defaultMessage="To send you notifications, we need your email address. If you'd like to receive notifications, please enter your email address. Otherwise, click 'Skip'"
                description="Message to the user on how to receive notifications to their email address"
              />
            }
          />
          <br />
          <div className={inputStyles['form-fieldset']}>
            <TextField
              className={inputStyles['form-fieldset-field']}
              componentProps={{
                id: 'user-email__input',
              }}
              label={
                <FormattedMessage
                  id="userEmail.emailInputLabel"
                  defaultMessage="Email"
                  description="Text field label for the email address field"
                />
              }
              placeholder={
                this.props.intl.formatMessage(messages.emailHint)
              }
              helpContent={this.state.message}
            />
          </div>
          <div className={inputStyles['form-footer-actions']}>
            <ButtonMain
              size="default"
              variant="text"
              theme="lightText"
              onClick={this.handleClickSkip}
              label={
                <FormattedMessage id="userEmail.skip" defaultMessage="Skip" description="Button label for skipping step" />
              }
            />
            <ButtonMain
              onClick={this.handleSubmit}
              size="default"
              variant="contained"
              theme="brand"
              label={
                <FormattedMessage id="userEmail.submit" defaultMessage="Submit" description="Button label to submit the email form" />
              }
            />
          </div>
        </div>
      );
    }

    return null;
  }
}

UserEmail.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserEmail);
