import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import userFragment from '../../relay/userFragment';
import TeamMembersComponent from './TeamMembersComponent';

const TeamContainer = Relay.createContainer(TeamMembersComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        slug,
        permissions,
        team_users(first: 10000) {
          edges {
            node {
              user {
                ${userFragment}
              },
              status,
              team_id,
              user_id,
              id,
              role
            }
          }
        },
      }
    `,
  },
});

class TeamMembers extends Component {
  render() {
    const route = new TeamRoute({ teamSlug: this.props.params.team });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default TeamMembers;
