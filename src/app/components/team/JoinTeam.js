import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import JoinTeamComponent from './JoinTeamComponent';

const TeamContainer = Relay.createContainer(JoinTeamComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on PublicTeam {
        name,
        dbid,
        subdomain
      }
    `,
  },
});

class JoinTeam extends Component {
  render() {
    const route = new PublicTeamRoute();
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default JoinTeam;
