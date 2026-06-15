import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as Sentry from '@sentry/react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ErrorPage from './ErrorPage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

const notifySentry = (
  error,
  component,
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
  const sentryIssueUrl = `https://sentry.io/${config.sentryOrg}/${config.sentryProject}/?query=${eventId}`;
  return sentryIssueUrl;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, sentryUrl: null };

    window.onerror = (message, source, lineno, colno, error) => {
      notifySentry(error, 'window');
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    const { component } = this.props;
    const sentryUrl = notifySentry(error, component);
    this.setState({ sentryUrl });
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
          sentryUrl={this.state.sentryUrl}
        />
      );
    }

    return this.props.children;
  }
}

export default injectIntl(ErrorBoundary);

