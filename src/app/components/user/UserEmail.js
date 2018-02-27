import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ConfirmEmail from './ConfirmEmail';
import { safelyParseJSON } from '../../helpers';
import { updateUserNameEmail } from '../../relay/mutations/UpdateUserNameEmailMutation';
import { units } from '../../styles/js/shared';

const messages = defineMessages({
  title: {
    id: 'userEmail.title',
    defaultMessage: 'Add your email',
  },
  submit: {
    id: 'userEmail.submit',
    defaultMessage: 'Submit',
  },
  skip: {
    id: 'userEmail.skip',
    defaultMessage: 'Skip',
  },
});

class UserEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  render() {
    const handleSubmit = () => {
      const email = document.getElementById('user-email__input').value;

      const onSuccess = () => {
        this.setState({ message: null });
        document.getElementById('user-email__input').value = '';
      };

      const onFailure = (transaction) => {
        const error = transaction.getError();
        const json = safelyParseJSON(error.source);
        this.setState({ message: json.error });
      };

      if (email) {
        updateUserNameEmail(this.props.user.id, this.props.user.name, email, onSuccess, onFailure);
      }
    };

    if (this.props.user.unconfirmed_email) {
      return <ConfirmEmail user={this.props.user} />;
    } else if (!this.props.user.email) {
      return (
        <Card style={{ marginBottom: units(2) }}>
          <CardTitle title={this.props.intl.formatMessage(messages.title)} />
          <CardText>
            <FormattedMessage
              id="userEmail.text"
              defaultMessage={
                'To send you notifications, we need your email address. If you\'d like to receive notifications, please enter your email address. Otherwise, click "Skip"'
              }
            />
            <div>
              <TextField
                id="user-email__input"
                floatingLabelText={
                  <FormattedMessage
                    id="userEmail.emailInputLabel"
                    defaultMessage="Email"
                  />
                }
                hintText={
                  <FormattedMessage
                    id="userEmail.emailInputHint"
                    defaultMessage="email@example.com"
                  />
                }
                errorText={this.state.message}
                fullWidth
              />
            </div>
          </CardText>
          <CardActions>
            <FlatButton
              label={this.props.intl.formatMessage(messages.skip)}
              onClick={handleSubmit.bind(this)}
            />
            <FlatButton
              label={this.props.intl.formatMessage(messages.submit)}
              onClick={handleSubmit.bind(this)}
              primary
            />
          </CardActions>
        </Card>
      );
    }

    return null;
  }
}

export default injectIntl(UserEmail);
