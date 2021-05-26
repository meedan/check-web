import React from 'react';
import Relay from 'react-relay/classic';
import UserRoute from '../../relay/UserRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';
import MediasLoading from '../media/MediasLoading';

const UserContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => userFragment,
  },
});

const User = (props) => {
  const route = new UserRoute({ userId: props.params.userId });
  return (
    <Relay.RootContainer
      Component={UserContainer}
      route={route}
      renderLoading={() => <MediasLoading />}
      renderFetched={data => <UserContainer {...props} {...data} />}
    />
  );
};

export default User;
