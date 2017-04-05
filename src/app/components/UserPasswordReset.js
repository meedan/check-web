import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { Card, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

class UserPasswordReset extends Component {
  render() {
    return (
      <div className="user-password-reset__component">
        <Card className="user-password-reset__card">
          <CardText>
            <h3><FormattedMessage id="passwordReset.title" defaultMessage="Forgot password" /></h3>
            <FormattedMessage id="passwordReset.text" defaultMessage="Happens to everybody! Add your address and an email will be sent with further instructions." />
            <div className="user-password-reset__email-input">
              <TextField id="password-reset-email-input" floatingLabelText={<FormattedMessage id="passwordReset.email" defaultMessage="Email" fullWidth />} />
            </div>
          </CardText>
          <CardActions className="user-password-reset__actions">
            <FlatButton label={<FormattedMessage id="passwordReset.cancel" defaultMessage="Nevermind" />} />
            <FlatButton label={<FormattedMessage id="passwordReset.submit" defaultMessage="Reset Password" primary/>} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default UserPasswordReset;
