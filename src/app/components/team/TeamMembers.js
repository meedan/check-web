import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
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
                id,
                dbid,
                name,
                source {
                  id,
                  dbid,
                  image,
                }
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
    console.log(this.props);
    const route = new TeamRoute({ teamSlug: this.props.teamSlug });
    return (<Relay.RootContainer
      Component={TeamContainer}
      route={route}
    />);
  }
}

export default TeamMembers;
