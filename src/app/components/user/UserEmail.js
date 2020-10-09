import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ConfirmEmail from './ConfirmEmail';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import { updateUserNameEmail } from '../../relay/mutations/UpdateUserNameEmailMutation';
import { units } from '../../styles/js/shared';

const messages = defineMessages({
  title: {
    id: 'userEmail.title',
    defaultMessage: 'Add your email',
  },
  emailHint: {
    id: 'userEmail.emailInputHint',
    defaultMessage: 'email@example.com',
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
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
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
      return <ConfirmEmail user={this.props.user} />;
    } else if (!this.props.user.email && window.storage.getValue('dismiss-user-email-nudge') !== '1') {
      return (
        <Card style={{ marginBottom: units(2) }}>
          <CardHeader title={this.props.intl.formatMessage(messages.title)} />
          <CardContent>
            <FormattedMessage
              id="userEmail.text"
              defaultMessage={
                'To send you notifications, we need your email address. If you\'d like to receive notifications, please enter your email address. Otherwise, click "Skip"'
              }
            />
            <div>
              <TextField
                id="user-email__input"
                label={
                  <FormattedMessage
                    id="userEmail.emailInputLabel"
                    defaultMessage="Email"
                  />
                }
                placeholder={
                  this.props.intl.formatMessage(messages.emailHint)
                }
                helperText={this.state.message}
                error={this.state.message}
                margin="normal"
                fullWidth
              />
            </div>
          </CardContent>
          <CardActions>
            <Button onClick={this.handleClickSkip}>
              <FormattedMessage id="userEmail.skip" defaultMessage="Skip" />
            </Button>
            <Button onClick={this.handleSubmit} color="primary">
              <FormattedMessage id="userEmail.submit" defaultMessage="Submit" />
            </Button>
          </CardActions>
        </Card>
      );
    }

    return null;
  }
}

UserEmail.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserEmail);
