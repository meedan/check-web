import React, { Component } from 'react';
import Relay from 'react-relay';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import teamPublicFragment from '../../relay/teamPublicFragment';
import TeamHeaderComponent from './TeamHeaderComponent';

const TeamPublicHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

class TeamPublicHeader extends Component {
  render() {
    const teamSlug = (this.props.params && this.props.params.team) ? this.props.params.team : '';
    const route = new PublicTeamRoute({ teamSlug });
    return (
      <Relay.RootContainer
        Component={TeamPublicHeaderContainer}
        route={route}
        renderFetched={data => <TeamPublicHeaderContainer {...this.props} {...data} />}
      />
    );
  }
}

export default TeamPublicHeader;
