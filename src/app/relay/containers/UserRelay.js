import React from 'react';
import Relay from 'react-relay';
import UserRoute from '../../relay/UserRoute';
import User from '../../components/source/User';
import userFragment from '../../relay/userFragment';

const UserContainer = Relay.createContainer(User, {
  fragments: {
    user: () => userFragment,
  },
});

const UserRelay = (props) => {
  const route = new UserRoute({ userId: props.params.userId });
  return (<Relay.RootContainer Component={UserContainer} route={route} />);
};

export default UserRelay;
