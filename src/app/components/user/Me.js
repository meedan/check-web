import React from 'react';
import Relay from 'react-relay/classic';
import MeComponent from './MeComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
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
        route={route}
        renderLoading={() => <MediasLoading theme="white" variant="page" size="large" />}
        renderFetched={data => <MeContainer {...props} {...data} />}
      />
    </ErrorBoundary>
  );
};

export default Me;
