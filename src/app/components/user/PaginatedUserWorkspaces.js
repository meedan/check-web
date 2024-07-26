/* eslint-disable relay/unused-fields */
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import UserWorkspacesComponent from './UserWorkspacesComponent';

// Query that is called for subsequent "load more" pagination calls
// see https://meedan.atlassian.net/wiki/spaces/ENG/pages/1185316865/How+to+paginate+in+Relay+1.7#Modifying-MediaSuggestions
const userWorkspacesQuery = graphql`
  query UserWorkspaces {
    me {
      id
      current_team {
        id
      }
      number_of_teams
      ...PaginatedUserWorkspaces_me
    }
  }
`;

const PaginatedUserWorkspaces = createPaginationContainer(
  props => (
    <UserWorkspacesComponent
      teams={props.root.team_users ? props.root.team_users?.edges.map(r => r.node) : []}
      pageSize={props.pageSize}
      totalCount={props.root.team_users?.totalCount}
      relay={props.relay}
    />
  ),
  {
    root: graphql`
      fragment PaginatedUserWorkspaces_me on Me {
        team_users(first: $pageSize, after: $after, status: "member") @connection(key: "PaginatedUserWorkspaces_team_users"){
          edges {
            node {
              team {
                id,
                dbid,
                name,
                avatar,
                slug,
                private,
                members_count,
                permissions,
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
      ids: fragmentVariables.ids,
      after: paginationInfo.cursor,
    }),
  },
);

export default PaginatedUserWorkspaces;
