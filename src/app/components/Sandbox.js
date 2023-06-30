/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styles from './sandbox.module.css';
import Chip from './cds/buttons-checkboxes-chips/Chip';
import TagList from './cds/menus-lists-dialogs/TagList';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';

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
    <div className={styles.sandbox}>
      <h5>
        UI Sandbox&nbsp;<span role="img" aria-label="Beach">🏖️</span>
      </h5>
      <section>
        <h6>Buttons</h6>
        <div>
          <span className="typography-subtitle1">ButtonMain</span>
          <ButtonMain
            label={
              <FormattedMessage
                id="saveList.saveList"
                defaultMessage="Save"
                description="'Save' here is in infinitive form - it's a button label, to save the current set of filters applied to a search result as a list."
              >
                {(...content) => content}
              </FormattedMessage>
            }
          />
        </div>
      </section>
      <section>
        <h6>Inputs</h6>
        <div>
          <span className="typography-subtitle1">TextField</span>
        </div>
      </section>
      <section>
        <h6>Chips</h6>
        <div>
          <span className="typography-subtitle1">Chip</span>
          <Chip
            label="Tag Name"
          />
        </div>
        <div>
          <span className="typography-subtitle1">Chip (removable)</span>
          <Chip
            label="Tag Name"
            onRemove={() => {}}
          />
        </div>
      </section>
      <section>
        <h6>Tags</h6>
        <div style={{ width: '300px' }}>
          <span className="typography-subtitle1">Tag List</span>
          <TagList
            tags={tags}
            setTags={setTags}
          />
        </div>
        <div style={{ width: '300px' }}>
          <span className="typography-subtitle1">Tag List (read-only)</span>
          <TagList
            readOnly
            tags={tags}
            setTags={setTags}
          />
        </div>
        <div style={{ width: '300px' }}>
          <span className="typography-subtitle1">Tag List (maxTags: 5)</span>
          <TagList
            tags={tags}
            setTags={setTags}
            maxTags={5}
          />
        </div>
        <div>
          <span className="typography-subtitle1">Tag List (no fixed width)</span>
          <TagList
            tags={tags}
            setTags={setTags}
          />
        </div>
      </section>
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
