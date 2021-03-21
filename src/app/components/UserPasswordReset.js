import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import PageTitle from './PageTitle';
import { FormattedGlobalMessage } from './MappedMessage';
import CheckAgreeTerms from './CheckAgreeTerms';
import globalStrings from '../globalStrings';
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

const UserPasswordReset = (props) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const [expiry, setExpiry] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [email, setEmail] = React.useState(null);

  const handleGoBack = () => {
    browserHistory.goBack();
  };

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const handleChange = (e) => {
    const value = e.target.value.trim();
    const canSubmit = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    const message = canSubmit ? '' : (
      <FormattedMessage
        id="passwordReset.emailNotValid"
        defaultMessage="Please enter a valid email address."
        description="Error message for invalid email address"
      />
    );
    setErrorMsg(message);
    setEmail(value);
    setSubmitDisabled(!canSubmit);
  };

  const handleSubmit = (e) => {
    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="passwordReset.emailNotFoundContactSupport"
          defaultMessage="Sorry, this email was not found. Please contact {supportEmail} if you think this is an error."
          values={{
            supportEmail: stringHelper('SUPPORT_EMAIL'),
          }}
          description="Error message for not found email"
        />
      );
      setErrorMsg(message);
      setSubmitDisabled(true);
    };

    const onSuccess = (response) => {
      // TODO Handle `success !== true`
      setShowConfirmDialog(true);
      setExpiry(response.resetPassword.expiry);
    };

    if (!submitDisabled) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation UserPasswordResetResetPasswordMutation($input: ResetPasswordInput!) {
            resetPassword(input: $input) {
              success
              expiry
            }
          }
        `,
        variables: {
          input: {
            email,
          },
        },
        onCompleted: ({ response, error }) => {
          if (error) {
            return onFailure(error);
          }
          return onSuccess(response);
        },
        onError: onFailure,
      });
    }
    e.preventDefault();
  };

  const previousErrorMsg = props.location.state && props.location.state.errorMsg;

  const pagetitleMessage = (
    <FormattedMessage
      id="passwordReset.title"
      defaultMessage="Reset password"
      description="Reset password page title"
    />
  );

  const classes = useStyles();

  return (
    <PageTitle>
      <Box m={2} align="center">
        <FormattedHTMLMessage {...globalStrings.bestViewed} />
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
            { pagetitleMessage }
          </StyledSubHeader>
          { showConfirmDialog ? [
            <CardContent key="usr-2" className="user-password-reset__sent_password">
              <FormattedMessage
                id="passwordReset.confirmedText"
                defaultMessage="We've sent you an email from {adminEmail} with instructions to reset your password. Make sure it didn't wind up in your spam mailbox. If you aren't receiving our password reset emails, contact {supportEmail}. Please note that the link in this email will expire in {expiry} hours."
                values={{
                  adminEmail: stringHelper('ADMIN_EMAIL'),
                  supportEmail: stringHelper('SUPPORT_EMAIL'),
                  expiry: Math.floor(expiry / 3600),
                }}
              />
            </CardContent>,
            <Typography component="div" align="center">
              <Button
                color="primary"
                variant="contained"
                disabled={submitDisabled}
                onClick={handleSignIn}
              >
                <FormattedMessage id="passwordReset.signIn" defaultMessage="Sign In" />
              </Button>
            </Typography>,
          ] : [
            <CardContent key="usr-2">
              { previousErrorMsg ? <p>{previousErrorMsg}</p> : null }
              <FormattedMessage id="passwordReset.text" defaultMessage="Add your address and an email will be sent with further instructions." />
              <div className="user-password-reset__email-input">
                <TextField
                  id="password-reset-email-input"
                  type="email"
                  label={<FormattedMessage id="passwordReset.email" defaultMessage="Email" />}
                  onChange={handleChange}
                  helperText={errorMsg}
                  error={errorMsg}
                  fullWidth
                  autoFocus
                />
              </div>
            </CardContent>,
            <CardActions key="usr-3" className="user-password-reset__actions">
              <Button onClick={handleGoBack}>
                <FormattedMessage {...globalStrings.cancel} />
              </Button>
              <Button color="primary" disabled={submitDisabled} onClick={handleSubmit}>
                { pagetitleMessage }
              </Button>
            </CardActions>,
          ]}
        </StyledCard>
        <Box my={4}>
          <CheckAgreeTerms />
        </Box>
      </ContentColumn>
    </PageTitle>
  );
};

UserPasswordReset.contextTypes = {
  store: PropTypes.object,
};

export default UserPasswordReset;
