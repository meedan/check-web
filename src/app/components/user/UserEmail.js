import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';

class UserEmail extends React.Component {
  handleClickSkip = () => {
    window.storage.set('dismiss-user-email-nudge', '1');
    this.forceUpdate();
  };

  render() {
    if (this.props.user.unconfirmed_email) {
      return null;
    } else if (!this.props.user.email && window.storage.getValue('dismiss-user-email-nudge') !== '1') {
      return (
        <>
          <Alert
            contained
            variant="warning"
            title={<FormattedMessage id="userEmail.alertTitle" defaultMessage="Add your email" description="Alert title for prompting the user to add their email address in order to receive notifications" />}
            content={
              <FormattedMessage
                id="userEmail.text"
                defaultMessage="To send you notifications, we need your email address. If you'd like to receive notifications, please enter your email address. Otherwise, click 'Skip'"
                description="Message to the user on how to receive notifications to their email address"
              />
            }
            buttonLabel={
              <FormattedMessage
                id="userEmail.skipNotifications"
                defaultMessage="Skip"
                description="Message to the user on how to skip receiving notifications because they did not provide an email address"
              />
            }
            onButtonClick={this.handleClickSkip}
          />
          <br />
        </>
      );
    }

    return null;
  }
}

UserEmail.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserEmail);
