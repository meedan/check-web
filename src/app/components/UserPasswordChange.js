import React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import PageTitle from './PageTitle';
import ChangePasswordComponent from './ChangePasswordComponent';
import { FormattedGlobalMessage } from './MappedMessage';
import CheckAgreeTerms from './CheckAgreeTerms';
import ErrorBoundary from './error/ErrorBoundary';
import { stringHelper } from '../customHelpers';
import {
  ContentColumn,
  StyledSubHeader,
  StyledCard,
} from '../styles/js/shared';

const useStyles = makeStyles({
  logo: {
    margin: '0 auto',
    display: 'block',
  },
});

function UserPasswordChange() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const getQueryStringValue = (key) => {
    const value = window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1');
    return decodeURIComponent(value);
  };

  const showConfirm = () => {
    setShowConfirmDialog(true);
  };

  const token = getQueryStringValue('reset_password_token');

  const classes = useStyles();

  return (
    <ErrorBoundary component="UserPasswordChange">
      <PageTitle>
        <Box m={2} align="center">
          <FormattedHTMLMessage
            id="global.bestViewed"
            defaultMessage='Best viewed with <a href="{chromedownload}">Chrome for Desktop</a>.'
            values={{ chromedownload: 'https://www.google.com/chrome/browser/desktop/' }}
            description="Message shown to the user when they are using an unsupported browser"
          />
        </Box>
        <ContentColumn center className="user-password-reset__component">
          <StyledCard>
            <FormattedGlobalMessage messageKey="appNameHuman">
              {appNameHuman => (
                <img
                  className={classes.logo}
                  alt={appNameHuman}
                  width="120"
                  src={stringHelper('LOGO_URL')}
                />
              )}
            </FormattedGlobalMessage>
            <StyledSubHeader className="reset-password__heading">
              { showConfirmDialog ?
                <FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" description="Title message when the user password was successfully updated" />
                : <FormattedMessage id="passwordChange.title" defaultMessage="Change password" description="Title message for the user to change their password" />
              }
            </StyledSubHeader>

            { showConfirmDialog ?
              <React.Fragment>
                <CardContent>
                  <FormattedMessage
                    id="passwordChange.successMsg"
                    defaultMessage="You're all set. Now you can log in with your new password."
                    description="Success message when the user's password was changed and they can now login using the new password"
                  />
                </CardContent>
                <CardActions className="user-password-change__actions">
                  <Button color="primary" onClick={handleSignIn}>
                    <FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" description="Button label for the user to continue to the sign in page" />
                  </Button>
                </CardActions>
              </React.Fragment> :
              <div className="user-password-change__card">
                <CardContent>
                  <ChangePasswordComponent
                    type="reset-password"
                    showCurrentPassword={false}
                    token={token}
                    showConfirm={showConfirm}
                  />
                </CardContent>
              </div>
            }
          </StyledCard>
          <Box my={4}>
            <CheckAgreeTerms />
          </Box>
        </ContentColumn>
      </PageTitle>
    </ErrorBoundary>
  );
}

export default UserPasswordChange;
