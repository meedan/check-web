import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import SourceComponent from './SourceComponent';
import sourceFragment from '../../relay/sourceFragment';

class MeComponent extends Component {
  render() {
    const source = this.props.me.source;

    return (<SourceComponent source={source} />);
  }
}

const MeContainer = Relay.createContainer(MeComponent, {
  fragments: {
    me: () => Relay.QL`
      fragment on User {
        source {
          ${sourceFragment}
        }
      }
    `
  }
});

class Me extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={MeContainer} route={route} />);
  }
}

export default Me;
