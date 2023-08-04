import React from 'react';
import Relay from 'react-relay/classic';
import UserComponent from './UserComponent';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import UserRoute from '../../relay/UserRoute';
import userFragment from '../../relay/userFragment';

const UserContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => userFragment,
  },
});

const User = (props) => {
  const route = new UserRoute({ userId: props.params.userId });
  return (
    <ErrorBoundary component="User">
      <Relay.RootContainer
        Component={UserContainer}
        route={route}
        renderLoading={() => <MediasLoading theme="grey" variant="page" size="large" />}
        renderFetched={data => <UserContainer {...props} {...data} />}
      />
    </ErrorBoundary>
  );
};

export default User;
