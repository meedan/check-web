import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';

const styles = {
  textAlign: {
    textAlign: 'center',
  },
};

const CheckAgreeTerms = props => (
  <Typography component="div" variant="body2">
    <p style={styles.textAlign}>
      <FormattedMessage
        id="CheckAgreeTerms.agreeTerms"
        defaultMessage="By signing up, you agree to the {appName} {tosLink} and {ppLink}."
        values={{
          appName: mapGlobalMessage(props.intl, 'appNameHuman'),
          tosLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
          ppLink: <a className="login-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>,
        }}
      />
    </p>

    <p style={styles.textAlign}>
      <FormattedHTMLMessage
        id="login.contactSupport"
        defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    </p>
  </Typography>
);

export default injectIntl(CheckAgreeTerms);
