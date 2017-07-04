import React, { Component, PropTypes } from 'react';
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
        team_users(first: 10000) {
          edges {
            node {
              user{
                name,
                email,
                profile_image,
                source {
                  dbid,
                  accounts(first: 10000) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
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
    const route = new TeamRoute({ teamSlug: this.props.params.team });
    return (<Relay.RootContainer Component={TeamContainer} route={route} />);
  }
}

export default TeamMembers;
