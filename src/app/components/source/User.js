import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UserRoute from '../../relay/UserRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';

const UserContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => userFragment
  },
});

class User extends Component {
  render() {
    const route = new UserRoute({ userId: this.props.params.userId });
    return (<Relay.RootContainer Component={UserContainer} route={route} />);
  }
}

export default User;
