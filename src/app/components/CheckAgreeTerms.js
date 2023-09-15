import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';

const CheckAgreeTerms = props => (
  <div className="typography-body1">
    <Box my={2} align="center">
      <FormattedMessage
        id="CheckAgreeTerms.agreeTerms"
        defaultMessage="By signing up, you agree to the {appName} {tosLink} and {ppLink}."
        description="Sign up agreeent message to ensure the user knows they are accepting the terms of service and privacy policy"
        values={{
          appName: mapGlobalMessage(props.intl, 'appNameHuman'),
          tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" description="Link text to go to the app terms of service document" /></a>,
          ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" description="Link text to go to the app privacy policy document" /></a>,
        }}
      />
    </Box>

    <Box my={2} align="center">
      <FormattedHTMLMessage
        id="login.contactSupport"
        defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        description="Help text for the user to know how to contact support by email"
      />
    </Box>
  </div>
);

export default injectIntl(CheckAgreeTerms);
