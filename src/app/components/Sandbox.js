/* eslint-disable relay/unused-fields, jsx-a11y/heading-has-content */
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

  const allTags = [
    {
      label: 'first',
      id: 1,
    },
    {
      label: 'second',
      id: 2,
    },
    {
      label: 'Third is Quite Long',
      id: 3,
    },
    {
      label: 'fourth',
      id: 4,
    },
    {
      label: 'fifth',
      id: 5,
    },
    {
      label: 'this is number 6',
      id: 6,
    },
    {
      label: 'SEVEN',
      id: 7,
    },
  ];

  const [tags, setTags] = React.useState([
    {
      label: 'first',
      id: 1,
    },
    {
      label: 'second',
      id: 2,
    },
    {
      label: 'Third is Quite Long',
      id: 3,
    },
    {
      label: 'fourth',
      id: 4,
    },
  ]);

  return (
    <div>
      <p className="typography-h2">UI Sandbox 🏖️</p>
      <div>
        <span className="typography-subtitle2">Chip</span>
        <Chip
          label="Tag Name"
        />
      </div>
      <div>
        <span className="typography-subtitle2">Removable Chip</span>
        <Chip
          label="Tag Name"
          removable
        />
      </div>
      <div style={{ width: '300px' }}>
        <span className="typography-subtitle2">Basic Tags</span>
        <TagList
          allTags={allTags}
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
