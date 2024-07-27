/* eslint-disable relay/unused-fields */
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import UserWorkspacesComponent from './UserWorkspacesComponent';

// Query that is called for subsequent "load more" pagination calls
// see https://meedan.atlassian.net/wiki/spaces/ENG/pages/1185316865/How+to+paginate+in+Relay+1.7#Modifying-MediaSuggestions
const userWorkspacesQuery = graphql`
  query PaginatedUserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
      id
      current_team_id
      number_of_teams
      ...PaginatedUserWorkspaces_root
    }
  }
`;

const PaginatedUserWorkspaces = createPaginationContainer(
  props => (
    <UserWorkspacesComponent
      teams={props.root.team_users ? props.root.team_users?.edges.map(r => r.node.team) : []}
      pageSize={props.pageSize}
      justEverything={props}
      justroot={props.root}
      totalCount={props.root.team_users?.totalCount}
      relay={props.relay}
      numberOfTeams={props.root.number_of_teams}
    />
  ),
  {
    root: graphql`
      fragment PaginatedUserWorkspaces_root on Me {
        number_of_teams
        team_users(first: $pageSize, after: $after, status: "member") @connection(key: "PaginatedUserWorkspaces_team_users"){
          edges {
            node {
              team {
                id,
                dbid,
                name,
                avatar,
                slug,
                members_count,
              }
              id,
              status,
              role
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
