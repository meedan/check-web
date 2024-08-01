/* eslint-disable relay/unused-fields */
// needed for the pagination items
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import UserWorkspacesComponent from './UserWorkspacesComponent';

// Query that is called for subsequent "load more" pagination calls
// see https://meedan.atlassian.net/wiki/spaces/ENG/pages/1185316865/How+to+paginate+in+Relay+1.7#Modifying-MediaSuggestions
const userWorkspacesQuery = graphql`
  query PaginatedUserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
      ...PaginatedUserWorkspaces_root
    }
  }
`;

const PaginatedUserWorkspaces = createPaginationContainer(
  props => (
    <UserWorkspacesComponent
      currentTeam={props.root.current_team_id}
      numberOfTeams={props.root.number_of_teams}
      pageSize={props.pageSize}
      relay={props.relay}
      teams={props.root.team_users.edges.map(n => n.node.team) || []}
      totalCount={props.root.team_users?.totalCount}
    />
  ),
  {
    root: graphql`
      fragment PaginatedUserWorkspaces_root on Me {
        number_of_teams
        current_team_id
        team_users(first: $pageSize, after: $after, status: "member") @connection(key: "PaginatedUserWorkspaces_team_users"){
          edges {
            node {
              team {
                dbid
                name
                avatar
                slug
                members_count
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    query: userWorkspacesQuery,
    getConnectionFromProps: props => props.root.team_users,
    getFragmentVariables: (previousVars, pageSize) => ({
      ...previousVars,
      pageSize,
    }),
    getVariables: (props, paginationInfo, fragmentVariables) => ({
      pageSize: fragmentVariables.pageSize,
      after: paginationInfo.cursor,
    }),
  },
);

export default PaginatedUserWorkspaces;
