import React from 'react';
import Relay from 'react-relay/classic';
import MeComponent from './MeComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import MeRoute from '../../relay/MeRoute';
import meFragment from '../../relay/meFragment';

const MeContainer = Relay.createContainer(MeComponent, {
  fragments: {
    me: () => meFragment,
  },
});

const Me = (props) => {
  const route = new MeRoute();
  return (
    <ErrorBoundary component="Me">
      <Relay.RootContainer
        Component={MeContainer}
        renderFetched={data => <MeContainer {...props} {...data} />}
        renderLoading={() => <Loader size="large" theme="white" variant="page" />}
        route={route}
      />
    </ErrorBoundary>
  );
};

export default Me;
