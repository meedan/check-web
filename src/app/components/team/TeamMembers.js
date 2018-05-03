import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import TeamMembersComponent from './TeamMembersComponent';

const TeamMembersContainer = Relay.createContainer(TeamMembersComponent, {
  initialVariables: {
    pageSize: 20,
  },
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        slug,
        permissions,
        limits,
        plan,
        team_users(first: $pageSize) {
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
              team {
                slug
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

const TeamMembers = (props) => {
  const route = new TeamRoute({ teamSlug: props.teamSlug });
  return (<Relay.RootContainer
    Component={TeamMembersContainer}
    route={route}
  />);
};

export default TeamMembers;
