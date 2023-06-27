/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Chip from './cds/buttons-checkboxes-chips/Chip';
import TagList from './cds/menus-lists-dialogs/TagList';

const SandboxComponent = ({ admin }) => {
  const isAdmin = admin?.is_admin;
  if (!isAdmin) {
    return null;
  }

  const [tags, setTags] = React.useState([
    'first',
    'second',
    'Third is Quite Long',
    'fourth',
    'fifth!',
    'This is Six',
  ]);

  return (
    <div>
      <p className="typography-h2">UI Sandbox 🏖️</p>
      <div>
        <p className="typography-subtitle2">Chip</p>
        <Chip
          label="Tag Name"
        />
      </div>
      <div>
        <p className="typography-subtitle2">Removable Chip</p>
        <Chip
          label="Tag Name"
          removable
        />
      </div>
      <div style={{ width: '300px' }}>
        <p className="typography-subtitle2">Basic Tags</p>
        <TagList
          tags={tags}
          setTags={setTags}
        />
      </div>
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
