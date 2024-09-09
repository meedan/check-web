import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';

const CheckAgreeTerms = props => (
  <>
    <FormattedMessage
      defaultMessage="By continuing, you agree to the {appName} {tosLink} and {ppLink}."
      description="Sign up agreement message to ensure the user knows they are accepting the terms of service and privacy policy"
      id="CheckAgreeTerms.agreeTerms"
      tagName="p"
      values={{
        appName: mapGlobalMessage(props.intl, 'appNameHuman'),
        tosLink: <a className="login-container__footer-link" href={stringHelper('TOS_URL')} rel="noopener noreferrer" target="_blank"><FormattedMessage defaultMessage="Terms of Service" description="Link text to go to the app terms of service document" id="tos.title" /></a>,
        ppLink: <a className="login-container__footer-link" href={stringHelper('PP_URL')} rel="noopener noreferrer" target="_blank"><FormattedMessage defaultMessage="Privacy&nbsp;Policy" description="Link text to go to the app privacy policy document" id="privacy.policy.title" /></a>,
      }}
    />
    <FormattedHTMLMessage
      defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
      description="Help text for the user to know how to contact support by email"
      id="login.contactSupport"
      tagName="p"
      values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
    />
  </>
);

export default injectIntl(CheckAgreeTerms);
