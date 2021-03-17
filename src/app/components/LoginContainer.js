import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import Favicon from 'react-favicon';
import Typography from '@material-ui/core/Typography';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Message from './Message';
import FooterRelay from '../relay/containers/FooterRelay';
import Login from './Login';
import CheckAgreeTerms from './CheckAgreeTerms';
import PageTitle from './PageTitle';
import globalStrings from '../globalStrings';
import {
  units,
  FadeIn,
  ContentColumn,
} from '../styles/js/shared';

const styles = {
  bestViewed: {
    marginTop: `${units(2)}`,
    textAlign: 'center',
  },
};

const LoginContainer = props => (
  <Typography component="div" variant="body2" gutterBottom>
    <PageTitle>
      <ContentColumn center id="login-container" className="login-container">
        <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />

        <p style={styles.bestViewed}>
          <FormattedHTMLMessage {...globalStrings.bestViewed} />
        </p>

        <Message message={props.message} />

        <FadeIn>
          <Login loginCallback={props.loginCallback} />
        </FadeIn>

        <CheckAgreeTerms />

        <FooterRelay {...props} />
      </ContentColumn>
    </PageTitle>
  </Typography>
);

export default injectIntl(LoginContainer);
