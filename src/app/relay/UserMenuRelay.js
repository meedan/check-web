import React, { Component } from 'react';
import Relay from 'react-relay';
import MeRoute from './MeRoute';
import UserMenu from '../components/UserMenu';
import userFragment from './userFragment';

const UserMenuContainer = Relay.createContainer(UserMenu, {
  fragments: {
    me: () => userFragment,
  },
});

class UserMenuRelay extends Component {
  render() {
    const route = new MeRoute();
    return (<Relay.RootContainer Component={UserMenuContainer} route={route} />);
  }
}

export default UserMenuRelay;
