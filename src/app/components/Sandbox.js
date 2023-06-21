/* eslint-disable relay/unused-fields, jsx-a11y/heading-has-content */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Chip from './cds/buttons-checkboxes-chips/Chip';

const SandboxComponent = ({ admin }) => {
  const isAdmin = admin?.is_admin;
  if (!isAdmin) {
    return null;
  }
  return (
    <div>
      <p className="typography-h2">UI Sandbox 🏖️</p>
      <p>
        <span className="typography-subtitle2">Chip</span>
        <Chip
          label="Tag Name"
        />
      </p>
      <p>
        <span className="typography-subtitle2">Removable Chip</span>
        <Chip
          label="Tag Name"
          removable
        />
      </p>
    </div>
  );
};

const Sandbox = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SandboxQuery {
        me {
          is_admin
        }
      }
    `}
    render={({ props }) => (
      <SandboxComponent admin={props?.me} />
    )}
  />
);

export default Sandbox;
