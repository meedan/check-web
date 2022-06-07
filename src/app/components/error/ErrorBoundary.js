import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import StackTrace from 'stacktrace-js';
import StackTraceGPS from 'stacktrace-gps';
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

const errbitNotifier = ({
  error,
  errorInfo,
  stackFrameArray,
  session,
  component,
  callIntercom,
}) => {
  fetch(`${config.errbitHost}/api/v3/projects/1/notices?key=${config.errbitApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': window.navigator.userAgent,
    },
    body: JSON.stringify({
      errors: [{
        type: error.name,
        message: error.message,
        backtrace: stackFrameArray[0].toString(),
      }],
      environment: {},
      params: { errorInfo, stackFrameArray },
      session,
      context: {
        component,
        severity: 'error',
        language: 'JavaScript',
        url: window.location.href,
        notifier: {
          name: 'Check ErrorBoundary',
          version: '0.150.0',
          url: 'https://github.com/meedan/check-web',
        },
      },
    }),
  }).then((response) => {
    if (response.ok) {
      response.json().then(data => callIntercom(data));
    }
  }).catch(err => console.error('Failed to notify Errbit:', err)); // eslint-disable-line no-console
};

const gps = new StackTraceGPS();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (config.errbitApiKey && config.errbitHost) {
      const { component, intl } = this.props;
      const errBack = err => console.error('stacktrace-js error:', err); // eslint-disable-line no-console

      StackTrace.fromError(error).then((stackFrameArray) => {
        gps.pinpoint(stackFrameArray[0]).then((foundFunctionName) => {
          console.log('foundFunctionName', foundFunctionName); // eslint-disable-line no-console
        }, errBack);

        const { dbid, email, name } = window.Check.store.getState().app.context.currentUser;
        const callIntercom = (data) => {
          if (Intercom) {
            Intercom(
              'showNewMessage',
              `${intl.formatMessage(messages.askSupport)}\n\n${data.url}`,
            );
          }
        };

        errbitNotifier({
          error,
          errorInfo,
          stackFrameArray,
          session: { name, dbid, email },
          component,
          callIntercom,
        });
      }, errBack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          pageTitle={null}
          cardTitle={
            <FormattedMessage
              id="mainErrorBoundary.cardTitle"
              defaultMessage="An unexpected error happened"
              description="Title for error state card displayed in error page"
            />
          }
          cardText={<GenericUnknownErrorMessage />}
        />
      );
    }

    return this.props.children;
  }
}

export default injectIntl(ErrorBoundary);
