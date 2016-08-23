import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import JoinTeamComponent from './JoinTeamComponent';
import teamFragment from '../../relay/teamFragment';

const TeamContainer = Relay.createContainer(JoinTeamComponent, {
  fragments: {
    team: () => teamFragment
  }
});

class JoinTeam extends Component {
  render() {
    var route = new TeamRoute({ teamId: this.props.params.teamId });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default JoinTeam;
