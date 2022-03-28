import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Notifier } from '@airbrake/browser';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ErrorPage from './ErrorPage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';

class MainErrorBoundary extends React.Component {
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
    if (this.airbrake) {
      this.airbrake.notify({
        error,
        params: { info: errorInfo },
      });
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

export default MainErrorBoundary;
