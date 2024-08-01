import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PaginatedUserWorkspaces from './PaginatedUserWorkspaces';

const userWorkspacesQuery = graphql`
  query UserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
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
      render={({ error, props: innerProps }) => {
        if (!error && innerProps) {
          const { me } = innerProps;
          return (
            <PaginatedUserWorkspaces root={me} pageSize={pageSize} />
          );
        }
        return null;
      }}
    />
  );
};

export default UserWorkspaces;

