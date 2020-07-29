import React from 'react';
import Relay from 'react-relay/classic';
import TeamRoute from '../../relay/TeamRoute';
import TeamMembersComponent from './TeamMembersComponent';
import TeamInviteMembers from './TeamInviteMembers';
import TeamMembersListItem from './TeamMembersListItem';

export const TeamMembersContainer = Relay.createContainer(TeamMembersComponent, {
  initialVariables: {
    pageSize: 20,
  },
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        ${TeamMembersListItem.getFragment('team')}
        ${TeamInviteMembers.getFragment('team')}
        dbid,
        name,
        slug,
        permissions,
        members_count,
        invited_mails,
        join_requests(first: 100) {
          edges {
            node {
              ${TeamMembersListItem.getFragment('teamUser')}
              id
              status
            }
          }
        },
        team_users(first: $pageSize) {
          edges {
            node {
              ${TeamMembersListItem.getFragment('teamUser')}
              id
              status
            }
          }
        }
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
