import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import UserComponent from './UserComponent';
import sourceFragment from '../../relay/sourceFragment';

class MeComponent extends Component {
  render() {
    return (<UserComponent user={this.props.user} />);
  }
}

const MeContainer = Relay.createContainer(MeComponent, {
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

class Me extends Component {
  render() {
    const route = new MeRoute();
    return (<Relay.RootContainer Component={MeContainer} route={route} />);
  }
}

export default Me;
