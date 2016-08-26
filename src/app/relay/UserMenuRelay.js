import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from './MeRoute';
import UserMenu from '../components/UserMenu';

const UserMenuContainer = Relay.createContainer(UserMenu, {
  fragments: {
    me: () => Relay.QL`
      fragment on User {
        name,
        provider,
        profile_image
      }
    `
  }
});

class UserMenuRelay extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={UserMenuContainer} route={route} />);
  }
}

export default UserMenuRelay;
