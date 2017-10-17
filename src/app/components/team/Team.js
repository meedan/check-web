import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import TeamComponent from './TeamComponent';
import teamFragment from '../../relay/teamFragment';

const TeamContainer = Relay.createContainer(TeamComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

class Team extends Component {
  render() {
    const slug = this.props.params.team || '';
    const route = new TeamRoute({ teamSlug: slug });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default Team;
