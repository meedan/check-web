import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';

class MeComponent extends Component {
  render() {
    return (<UserComponent user={this.props.user} />);
  }
}

const MeContainer = Relay.createContainer(MeComponent, {
  fragments: {
    user: () => userFragment
  },
});

class Me extends Component {
  render() {
    const route = new MeRoute();
    return (<Relay.RootContainer Component={MeContainer} route={route} />);
  }
}

export default Me;
