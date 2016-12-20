import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UserRoute from '../../relay/UserRoute';
import SourceComponent from './SourceComponent';
import sourceFragment from '../../relay/sourceFragment';

class UserComponent extends Component {
  render() {
    const source = this.props.user.source;

    return (<SourceComponent source={source} />);
  }
}

const UserContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        source {
          ${sourceFragment}
        }
      }
    `,
  },
});

class User extends Component {
  render() {
    const route = new UserRoute({ userId: this.props.params.userId });
    return (<Relay.RootContainer Component={UserContainer} route={route} />);
  }
}

export default User;
