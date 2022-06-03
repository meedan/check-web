import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Notifier } from '@airbrake/browser';
import StackTrace from 'stacktrace-js';
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    if (config.errbitApiKey && config.errbitHost) {
      this.airbrake = new Notifier({
        host: config.errbitHost,
        projectId: 1,
        projectKey: config.errbitApiKey,
      });
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { component, intl } = this.props;

    StackTrace.fromError(error).then((stackFrameArray) => {
      console.log('stackFrameArray[0]', stackFrameArray[0]); // eslint-disable-line no-console

      if (this.airbrake) {
        const { dbid, email, name } = window.Check.store.getState().app.context.currentUser;
        this.airbrake.notify({
          // For some reason we need to reinstantiate the error or pass the error as string.
          // Not doing this causes the additional info (contex, params, session) to be empty
          error: new Error(error),
          context: { component },
          params: { info: errorInfo, 'stacktrace-js': stackFrameArray[0] },
          session: { name, dbid, email },
        }).then((response) => {
          if (Intercom) {
            Intercom(
              'showNewMessage',
              `${intl.formatMessage(messages.askSupport)}\n\n${response.url}`,
            );
          }
        });
      }
    });
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
