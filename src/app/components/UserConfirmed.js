import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import { ContentColumn } from '../styles/js/shared';

const UserConfirmed = () =>
  <ContentColumn>
    <Card>
      <CardTitle
        className="main-title"
        title={<FormattedMessage id="userConfirmed.heading" defaultMessage="Account Confirmed" />}
      />
      <CardText>
        <p>
          <FormattedMessage
            id="userConfirmed.message"
            defaultMessage={'Thanks for confirming your e-mail address! Now you can sign in.'}
          />
        </p>

      </CardText>
      <CardActions>
        <Link to="/">
          <RaisedButton label={<FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />} primary />
        </Link>
      </CardActions>
    </Card>
  </ContentColumn>
;

export default UserConfirmed;
