/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';

const SandboxCrashComponent = ({ admin }) => {
  // The following line is designed to crash on purpose, unsafe property access
  const isAdmin = admin.is_admin.foo.bar;

  return (
    <div>
      {isAdmin}
    </div>
  );
};

const SandboxCrash = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SandboxCrashQuery {
        me {
          is_admin
        }
      }
    `}
    render={({ props }) => (
      <SandboxCrashComponent admin={props?.me} />
    )}
  />
);

export default SandboxCrash;

