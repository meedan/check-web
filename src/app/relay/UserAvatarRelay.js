import React, { Component } from 'react';
import Relay from 'react-relay';
import MeRoute from './MeRoute';
import UserAvatar from '../components/UserAvatar';
import userFragment from './userFragment';

const UserAvatarContainer = Relay.createContainer(UserAvatar, {
  fragments: {
    me: () => userFragment,
  },
});

class UserAvatarRelay extends Component {
  render() {
    const route = new MeRoute();
    return (<Relay.RootContainer Component={UserAvatarContainer} route={route} />);
  }
}

export default UserAvatarRelay;
