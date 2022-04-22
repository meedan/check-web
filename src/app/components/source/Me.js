import React from 'react';
import Relay from 'react-relay/classic';
import UserComponent from './UserComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';

const MeContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => userFragment,
  },
});

const Me = (props) => {
  const route = new MeRoute();
  return (
    <ErrorBoundary component="Me">
      <Relay.RootContainer
        Component={MeContainer}
        route={route}
        renderLoading={() => <MediasLoading />}
        renderFetched={data => <MeContainer {...props} {...data} />}
      />
    </ErrorBoundary>
  );
};

export default Me;
