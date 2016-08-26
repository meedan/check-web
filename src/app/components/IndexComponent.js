import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../relay/MeRoute';

class IndexComponent extends Component {
  render() {
    return null;
  }
}

const IndexContainer = Relay.createContainer(IndexComponent, {
  fragments: {
    me: () => Relay.QL`
      fragment on User {
        current_team {
          id
        }
      }
    `
  }
});

class Index extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={IndexContainer} route={route} />);
  }

  componentDidMount() {
    var redirectTo;
    const currentTeam = this.props.me ? this.props.me.current_team : null;

    if (currentTeam) {
      redirectTo = ('/team/' + currentTeam.id);
    } else {
      redirectTo = ('/teams/new');
    }

    this.props.history.push(redirectTo);
  }
}

export default Index;
