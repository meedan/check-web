import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import * as Sentry from '@sentry/react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ErrorPage from './ErrorPage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const messages = defineMessages({
  askSupport: {
    id: 'errorBoundary.message',
    defaultMessage: 'Hello, I\'m having trouble with Check. The web interface has just crashed and is blocking me from doing work!',
    description: 'Prefilled support request message when Check UI crashes',
  },
});

const notifySentry = (
  error,
  component,
  callIntercom,
) => {
  let eventId = '';
  if (config.sentryDsn) {
    eventId = Sentry.captureException(error, {
      contexts: {
        component: {
          name: component,
        },
      },
    });
  }
  // even if sentry isn't configured we should still call Intercom
  if (callIntercom) {
    // this url links directly to the sentry issue page
    const sentryIssueUrl = `https://sentry.io/${config.sentryOrg}/${config.sentryProject}/?query=${eventId}`;
    callIntercom({ url: sentryIssueUrl });
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };

    window.onerror = (message, source, lineno, colno, error) => {
      notifySentry(error, 'window');
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    const { component, intl } = this.props;

    const callIntercom = (data) => {
      if (window.Intercom) {
        Intercom(
          'showNewMessage',
          `${intl.formatMessage(messages.askSupport)}\n\n${data.url}`,
        );
      }
    };

    notifySentry(error, component, callIntercom);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          cardText={<GenericUnknownErrorMessage />}
          cardTitle={
            <FormattedMessage
              defaultMessage="An unexpected error happened"
              description="Title for error state card displayed in error page"
              id="mainErrorBoundary.cardTitle"
            />
          }
          pageTitle={null}
        />
      );
    }

    return this.props.children;
  }
}

export default injectIntl(ErrorBoundary);
