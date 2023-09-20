import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import Favicon from 'react-favicon';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Message from './Message';
import FooterRelay from '../relay/containers/FooterRelay';
import Login from './Login';
import CheckAgreeTerms from './CheckAgreeTerms';
import PageTitle from './PageTitle';
import {
  FadeIn,
  ContentColumn,
} from '../styles/js/shared';

const LoginContainer = props => (
  <Typography component="div" variant="body1" gutterBottom>
    <PageTitle>
      <ContentColumn center id="login-container" className="login-container">
        <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />

        <Box m={2} align="center">
          <FormattedHTMLMessage
            id="global.bestViewed"
            defaultMessage='Best viewed with <a href="{chromedownload}">Chrome for Desktop</a>.'
            values={{ chromedownload: 'https://www.google.com/chrome/browser/desktop/' }}
            description="Message shown to the user when they are using an unsupported browser"
          />
        </Box>

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
