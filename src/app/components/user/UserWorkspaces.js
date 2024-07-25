/* eslint-disable relay/unused-fields */
import React from 'react';
// todo switch from classic
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PaginatedUserWorkspaces from './PaginatedUserWorkspaces';

// updated error handling
const userWorkspacesQuery = graphql`
  query UserWorkspaces {
    me {
      id
      current_team {
        id
      }
      number_of_teams
      ...PaginatedUserWorkspaces_root
    }
  }
`;

const UserWorkspaces = () => {
  const pageSize = 10;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={userWorkspacesQuery}
      variables={{
        pageSize,
      }}
      render={({ props }) => {
        if (props) {
          return (
            <PaginatedUserWorkspaces root={props.me} parentProps={props} pageSize={pageSize} />
          );
        }
        return null;
      }}
    />
  );
};

export default UserWorkspaces;

