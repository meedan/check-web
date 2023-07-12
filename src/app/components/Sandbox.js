/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import styles from './sandbox.module.css';
import Chip from './cds/buttons-checkboxes-chips/Chip';
import TagList from './cds/menus-lists-dialogs/TagList';
import TextField from './cds/inputs/TextField';
import TextArea from './cds/inputs/TextArea';
import { ToggleButton, ToggleButtonGroup } from './cds/inputs/ToggleButtonGroup';
import Select from './cds/inputs/Select';
import SwitchComponent from './cds/inputs/SwitchComponent';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../icons/settings.svg';
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

  const [buttonDisabled, setMainButtonDisabled] = React.useState(Boolean(false));
  const [buttonVariant, setButtonVariant] = React.useState('contained');
  const onChangeButtonVariant = (event) => {
    setButtonVariant(event.target.value);
  };

  const [buttonSize, setButtonSize] = React.useState('default');
  const onChangeButtonSize = (event) => {
    setButtonSize(event.target.value);
  };

  const [buttonTheme, setButtonTheme] = React.useState('brand');
  const onChangeButtonTheme = (event) => {
    setButtonTheme(event.target.value);
  };

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
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>ButtonMain</div>
            <ul>
              <li>
                <Select
                  label="Variant"
                  onChange={onChangeButtonVariant}
                >
                  <option value="contained">contained (default)</option>
                  <option value="outlined">outlined</option>
                  <option value="text">text</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Size"
                  onChange={onChangeButtonSize}
                >
                  <option value="default">default</option>
                  <option value="small">small</option>
                  <option value="large">large</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Theme"
                  onChange={onChangeButtonTheme}
                >
                  <optgroup label="brand">
                    <option value="brand">brand (default)</option>
                    <option value="lightBrand">lightBrand</option>
                  </optgroup>
                  <optgroup label="text">
                    <option value="text">text</option>
                  </optgroup>
                  <optgroup label="error">
                    <option value="error">error</option>
                    <option value="lightError">lightError</option>
                  </optgroup>
                  <optgroup label="validation">
                    <option value="validation">validation</option>
                    <option value="lightValidation">lightValidation</option>
                  </optgroup>
                  <optgroup label="alert">
                    <option value="alert">alert</option>
                    <option value="lightAlert">lightAlert</option>
                  </optgroup>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="Disabled?"
                  labelPlacement="top"
                  checked={buttonDisabled}
                  onChange={() => setMainButtonDisabled(!buttonDisabled)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants}>
            <ButtonMain label="Default" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconLeft={<AddIcon />} label="Left" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconRight={<AddIcon />} label="Right" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconCenter={<AddIcon />} label="Center" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>ToggleButtonGroup</div>
          <ToggleButtonGroup
            label="I am a label"
            variant="contained"
            helpContent="I can be of help"
            value="1"
            exclusive
          >
            <ToggleButton value="1">
              One
            </ToggleButton>
            <ToggleButton value="2">
              Two
            </ToggleButton>
            <ToggleButton value="3">
              Three
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </section>
      <section id="sandbox-inputs">
        <h6>Inputs</h6>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>TextField</div>
          <TextField
            placeholder="I am a placeholder"
            label="I am a textfield title"
            helpContent="I can be of help to textfield"
            required
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>TextArea</div>
          <TextArea
            placeholder="I am a placeholder for textarea"
            label="I am a textarea title"
            helpContent="I can be of help to textarea"
            required
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Select</div>
          <Select
            iconLeft={<ListIcon />}
            helpContent="I can be of help to select"
            label="I am a select title"
            required
          >
            <option>Select...</option>
            <option value="1">one</option>
            <option value="2">two</option>
            <option value="3">three</option>
          </Select>
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>Switch</div>
          <div className={styles.componentInlineVariants}>
            <SwitchComponent
              label="Label on top"
              labelPlacement="top"
              helperContent="I can help switches"
            />
            <SwitchComponent
              label="Label on bottom"
              labelPlacement="bottom"
              helperContent="I can help switches"
            />
            <SwitchComponent
              label="Label start"
              labelPlacement="start"
              helperContent="I can help switches"
            />
            <SwitchComponent
              label="Label end"
              labelPlacement="end"
              helperContent="I can help switches"
            />
          </div>
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
