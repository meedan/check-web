import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import UserRoute from '../../relay/UserRoute';
import UserComponent from './UserComponent';
import sourceFragment from '../../relay/sourceFragment';

const UserContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id,
        name,
        email,
        permissions,
        teams (first: 10000){
          edges {
            node {
              name
            }
          }
        },
        current_team {
          name,
          permissions,
          projects (first: 1000){
            edges {
              node {
                title,
                dbid,
              }
            }
          }
        },
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
