import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
// Importing UserWorkspacesComponent for the fragment only
// eslint-disable-next-line no-unused-vars
import UserWorkspacesComponent, { PaginatedUserWorkspaces } from './UserWorkspacesComponent';

const userWorkspacesQuery = graphql`
  query UserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
      ...UserWorkspacesComponent_root
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
      render={({ error, props: innerProps }) => {
        if (!error && innerProps) {
          const { me } = innerProps;
          return (
            <PaginatedUserWorkspaces
              query={userWorkspacesQuery}
              pageSize={pageSize}
              root={me}
            />
          );
        }
        return null;
      }}
    />
  );
};

export default UserWorkspaces;

