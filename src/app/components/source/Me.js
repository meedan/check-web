import React from 'react';
import Relay from 'react-relay/classic';
import UserComponent from './UserComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import MeRoute from '../../relay/MeRoute';
import meFragment from '../../relay/meFragment';

const MeContainer = Relay.createContainer(UserComponent, {
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
        renderLoading={() => <MediasLoading theme="grey" variant="page" size="large" />}
        renderFetched={data => <MeContainer {...props} {...data} />}
      />
    </ErrorBoundary>
  );
};

export default Me;
