import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';

const CheckAgreeTerms = props => (
  <Typography component="div" variant="body2">
    <Box my={2} align="center">
      <FormattedMessage
        id="CheckAgreeTerms.agreeTerms"
        defaultMessage="By signing up, you agree to the {appName} {tosLink} and {ppLink}."
        values={{
          appName: mapGlobalMessage(props.intl, 'appNameHuman'),
          tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
          ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>,
        }}
      />
    </Box>

    <Box my={2} align="center">
      <FormattedHTMLMessage
        id="login.contactSupport"
        defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    </Box>
  </Typography>
);

export default injectIntl(CheckAgreeTerms);
