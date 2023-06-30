/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import styles from './sandbox.module.css';
import Chip from './cds/buttons-checkboxes-chips/Chip';
import TagList from './cds/menus-lists-dialogs/TagList';
import TextField from './cds/inputs/TextField';
import Select from './cds/inputs/Select';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import ListIcon from '../icons/list.svg';

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
      <ul className={styles.sandboxNav}>
        <li>
          <a href="#sandbox-buttons" title="Buttons">Buttons</a>
        </li>
        <li>
          <a href="#sandbox-inputs" title="Inputs">Inputs</a>
        </li>
        <li>
          <a href="#sandbox-chips" title="Chips">Chips</a>
        </li>
        <li>
          <a href="#sandbox-tags" title="Tags">Tags</a>
        </li>
      </ul>
      <section id="sandbox-buttons">
        <h6>Buttons</h6>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>ButtonMain</div>
          <ButtonMain label="Save" />
        </div>
      </section>
      <section id="sandbox-inputs">
        <h6>Inputs</h6>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>TextField</div>
          <TextField
            placeholder="I am a placeholder"
            label="I am a textfield title"
            helpContent="I can be of help"
            required
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Select</div>
          <Select
            iconLeft={<ListIcon />}
            helpContent="I can be of help"
            label="I am a select title"
            required
          >
            <option>Select...</option>
            <option value="1">one</option>
            <option value="2">two</option>
            <option value="3">three</option>
          </Select>
        </div>
      </section>
      <section id="sandbox-chips">
        <h6>Chips</h6>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Chip</div>
          <Chip
            label="Tag Name"
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Chip (removable)</div>
          <Chip
            label="Tag Name"
            onRemove={() => {}}
          />
        </div>
      </section>
      <section id="sandbox-tags">
        <h6>Tags</h6>
        <div className={styles.componentWrapper} style={{ width: '300px' }}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Tag List</div>
          <TagList
            tags={tags}
            setTags={setTags}
          />
        </div>
        <div className={styles.componentWrapper} style={{ width: '300px' }}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Tag List <small>(read-only)</small></div>
          <TagList
            readOnly
            tags={tags}
            setTags={setTags}
          />
        </div>
        <div className={styles.componentWrapper} style={{ width: '300px' }}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Tag List <small>(maxTags: 5)</small></div>
          <TagList
            tags={tags}
            setTags={setTags}
            maxTags={5}
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Tag List <small>(no fixed width)</small></div>
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
