import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';

class TeamHeader extends Component {

  render() {
    const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
      initialVariables: {
        pageSize: 10000,
      },
      fragments: {
        team: () => teamFragment,
      },
    });

    const teamSlug = this.props.params && this.props.params.team
      ? this.props.params.team
      : '';

    const route = new TeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderFetched={data => <TeamHeaderContainer {...this.props} {...data} />}
      />
    );
  }
}

export default TeamHeader;
