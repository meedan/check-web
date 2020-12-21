import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import { ContentColumn } from '../styles/js/shared';

const UserConfirmed = () => (
  <ContentColumn>
    <Card>
      <CardHeader
        className="main-title"
        title={<FormattedMessage id="userConfirmed.heading" defaultMessage="Account Confirmed" />}
      />
      <CardContent>
        <p>
          <FormattedMessage
            id="userConfirmed.message"
            defaultMessage="Thanks for confirming your email address! Now you can sign in."
          />
        </p>
      </CardContent>
      <CardActions>
        <Link to="/">
          <Button variant="contained" color="primary">
            <FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />
          </Button>
        </Link>
      </CardActions>
    </Card>
  </ContentColumn>);

export default UserConfirmed;
