import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../TeamRoute';
import TeamMenu from '../../components/team/TeamMenu';

const TeamMenuContainer = Relay.createContainer(TeamMenu, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        slug,
        permissions,
      }
    `,
  },
});

class TeamMenuRelay extends Component {
  render() {
    if (this.props.params.team) {
      const route = new TeamRoute({ teamSlug: this.props.params.team });
      return <Relay.RootContainer Component={TeamMenuContainer} route={route} />;
    }
    return null;
  }
}

export default TeamMenuRelay;
