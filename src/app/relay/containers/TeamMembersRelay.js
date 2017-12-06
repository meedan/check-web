import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../TeamRoute';
import TeamMembers from '../../components/team/TeamMembers';

const TeamContainer = Relay.createContainer(TeamMembers, {
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

const TeamMembersRelay = (props) => {
  const route = new TeamRoute({ teamSlug: props.teamSlug });
  return (<Relay.RootContainer
    Component={TeamContainer}
    route={route}
  />);
};

export default TeamMembersRelay;
