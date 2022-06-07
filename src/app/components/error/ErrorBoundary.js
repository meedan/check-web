import React from 'react';
// import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { FormattedMessage, injectIntl } from 'react-intl';
// import { Notifier } from '@airbrake/browser';
import StackTrace from 'stacktrace-js';
import StackTraceGPS from 'stacktrace-gps';
// import config from 'config'; // eslint-disable-line require-path-exists/exists
import ErrorPage from './ErrorPage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const gps = new StackTraceGPS();

// const messages = defineMessages({
//   askSupport: {
//     id: 'errorBoundary.message',
//     defaultMessage: 'Hello, I\'m having trouble with Check. The web interface has just crashed and is blocking me from doing work!',
//     description: 'Prefilled support request message when Check UI crashes',
//   },
// });

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    // if (config.errbitApiKey && config.errbitHost) {
    //   this.airbrake = new Notifier({
    //     host: config.errbitHost,
    //     projectId: 1,
    //     projectKey: config.errbitApiKey,
    //   });
    // }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidCatch(error, errorInfo) {
    // const { component, intl } = this.props;
    console.log('error', error); // eslint-disable-line no-console

    console.log('errorInfo', errorInfo); // eslint-disable-line no-console

    StackTrace.fromError(error).then((stackFrameArray) => {
      console.log('stackFrameArray[0]', stackFrameArray[0]); // eslint-disable-line no-console

      gps.pinpoint(stackFrameArray[0]).then((foundFunctionName) => {
        console.log('foundFunctionName', foundFunctionName); // eslint-disable-line no-console
      });

      // const { dbid, email, name } = window.Check.store.getState().app.context.currentUser;
      //
      // fetch(`${config.errbitHost}/api/v3/projects/1/notices?key=${config.errbitApiKey}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'User-Agent': window.navigator.userAgent,
      //   },
      //   body: JSON.stringify({
      //     errors: [{
      //       type: error.name,
      //       message: error.message,
      //       backtrace:
      //     }],
      //     environment: {},
      //     params: { info: errorInfo, 'stacktrace-js': stackFrameArray[0] },
      //     session: { name, dbid, email },
      //     context: {
      //       component,
      //       severity: 'error',
      //       language: 'JavaScript',
      //       url: window.location.href,
      //       notifier: {
      //         name: 'Check ErrorBoundary',
      //         version: '0.150.0',
      //         url: 'https://github.com/meedan/check-web',
      //       },
      //     },
      //   }),
      // }).then((response) => {
      //   console.log('response', response);
      // }).then(json => console.log(json)
      // ).catch(err => console.log(err));

      // .then((response) => {
      //   if (Intercom) {
      //     Intercom(
      //       'showNewMessage',
      //       `${intl.formatMessage(messages.askSupport)}\n\n${response.url}`,
      //     );
      //   }
      // });
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
