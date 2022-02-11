/* eslint-disable @calm/react-intl/missing-attribute */
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
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import globalStrings from '../globalStrings';
import { stringHelper } from '../customHelpers';
import { getErrorMessageForRelayModernProblem } from '../helpers';
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
  confirmText: {
    lineHeight: '1.5em',
  },
});

const UserPasswordReset = (props) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
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
    const onFailure = (error) => {
      const message = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
      setErrorMsg(message);
      setSubmitDisabled(true);
    };

    const onSuccess = () => {
      setShowConfirmDialog(true);
    };

    if (!submitDisabled) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation UserPasswordResetResetPasswordMutation($input: ResetPasswordInput!) {
            resetPassword(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            email,
          },
        },
        onCompleted: onSuccess,
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
            <CardContent key="usr-2" className={['user-password-reset__sent_password', classes.confirmText].join(' ')} >
              <FormattedMessage
                id="passwordReset.confirmedText"
                defaultMessage="If this email address exists, you will receive an email from {adminEmail} with instructions to reset your password. Make sure it didn't wind up in your spam mailbox. If you aren't receiving our password reset emails, contact {supportEmail}."
                values={{
                  adminEmail: stringHelper('ADMIN_EMAIL'),
                  supportEmail: stringHelper('SUPPORT_EMAIL'),
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
                  variant="outlined"
                  margin="normal"
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
