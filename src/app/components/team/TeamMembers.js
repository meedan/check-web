import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import TeamMembersComponent from './TeamMembersComponent';
import teamFragment from '../../relay/teamFragment';

const TeamContainer = Relay.createContainer(TeamMembersComponent, {
  fragments: {
    team: () => teamFragment
  }
});

class TeamMembers extends Component {
  render() {
    var route = new TeamRoute({ teamId: this.props.params.teamId });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default TeamMembers;
