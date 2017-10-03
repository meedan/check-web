import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import teamPublicFragment from '../../relay/teamPublicFragment';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import JoinTeamComponent from './JoinTeamComponent';

const TeamContainer = Relay.createContainer(JoinTeamComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

class JoinTeam extends Component {
  render() {
    const teamSlug = (this.props.params && this.props.params.team) ? this.props.params.team : '';
    const route = new PublicTeamRoute({ teamSlug });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default JoinTeam;
