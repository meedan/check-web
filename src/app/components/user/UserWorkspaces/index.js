import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
// Importing UserWorkspacesComponent for the fragment only
// eslint-disable-next-line no-unused-vars
import PaginatedUserWorkspaces from './PaginatedUserWorkspaces';
import Loader from '../../cds/loading/Loader';

const userWorkspacesQuery = graphql`
  query UserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
      ...PaginatedUserWorkspaces_root
    }
  }
`;

const UserWorkspaces = () => {
  const pageSize = 100;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={userWorkspacesQuery}
      render={({ error, props: innerProps }) => {
        if (!error && innerProps) {
          const { me } = innerProps;
          return (
            <PaginatedUserWorkspaces
              pageSize={pageSize}
              root={me}
            />
          );
        }
        if (!error && !innerProps) {
          return (
            <Loader />
          );
        }
        return null;
      }}
      variables={{
        pageSize,
      }}
    />
  );
};

export default UserWorkspaces;

