/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import * as Sentry from '@sentry/react';
import styles from './sandbox.module.css';
import Alert from './cds/alerts-and-prompts/Alert';
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
import FigmaColorLogo from '../icons/figma_color.svg';
import Card from './cds/media-cards/Card.js';
import LimitedTextArea from './layout/inputs/LimitedTextArea';

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

  const [alertFloating, setAlertFloating] = React.useState(Boolean(false));
  const [alertIcon, setAlertIcon] = React.useState(Boolean(true));
  const [alertButton, setAlertButton] = React.useState(Boolean(true));
  const [alertTitle, setAlertTitle] = React.useState(Boolean(true));
  const [alertContent, setAlertContent] = React.useState(Boolean(true));
  const [alertClosable, setAlertClosable] = React.useState(Boolean(true));
  const [tagsFixedWidth, setTagsFixedWidth] = React.useState(Boolean(false));
  const [maxTags, setMaxTags] = React.useState(Boolean(false));
  const [tagsReadOnly, setTagsReadOnly] = React.useState(Boolean(false));
  const [chipRemovable, setChipRemovable] = React.useState(Boolean(false));
  const [buttonDisabled, setMainButtonDisabled] = React.useState(Boolean(false));
  const [switchesDisabled, setSwitchesDisabled] = React.useState(Boolean(false));
  const [switchesHelp, setSwitchesHelp] = React.useState(Boolean(false));
  const [switched, setSwitchExample] = React.useState(Boolean(false));
  const [limitedText, setLimitedText] = React.useState('Hello this is the initial limited text state');

  const [switchLabelPlacement, setSwitchLabelPlacement] = React.useState('top');
  const onChangeSwitchLabelPlacement = (event) => {
    setSwitchLabelPlacement(event.target.value);
  };

  const [alertVariant, setAlertVariant] = React.useState('info');
  const onChangeAlertVariant = (event) => {
    setAlertVariant(event.target.value);
  };

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

  const generateUncaughtError = () => {
    // eslint-disable-next-line
    thisGeneratesSandboxError();
  };

  const generateManualError = () => {
    const { dbid, email, name } = window.Check.store.getState().app.context.currentUser;
    Sentry.setUser({ email, id: dbid, name });

    const context = {
      tags: {
        level: 'error',
        language: navigator.language,
      },
      user: {
        userAgent: window.navigator.userAgent,
        windowSize: {
          height: window.screen.availHeight,
          width: window.screen.availWidth,
        },
        name,
        email,
        id: dbid,
      },
      contexts: {
        component: {
          name: 'Sandbox',
          url: window.location.href,
        },
        notifier: {
          name: 'Check Sandbox Manual Error Button',
        },
      },
    };

    Sentry.captureException(new Error(`This is a captured error inside the sandbox! Random number: ${Math.random()}`), context);
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
          <a href="#sandbox-cards" title="Cards">Cards</a>
        </li>
        <li>
          <a href="#sandbox-tags" title="Tags">Tags</a>
        </li>
        <li>
          <a href="#sandbox-alerts-prompts" title="Alerts & Prompts">Alerts &amp; Prompts</a>
        </li>
      </ul>
      <section id="sandbox-buttons">
        <h6>Buttons</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              ButtonMain
              <a
                href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=139-6525&mode=design&t=ZVq51pKdIKdWZicO-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
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
                    <option value="lightText">lightText</option>
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
                  label="Disabled"
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
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            Trigger Sentry error
          </div>
          <ButtonMain label="Trigger Sentry" onClick={generateUncaughtError} variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
          <ButtonMain label="Sentry manual error" onClick={generateManualError} variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            ToggleButtonGroup
            <a
              href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3703-28265&mode=design&t=ZVq51pKdIKdWZicO-4"
              rel="noopener noreferrer"
              target="_blank"
              title="Figma Designs"
              className={styles.figmaLink}
            >
              <FigmaColorLogo />
            </a>
          </div>
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
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            TextField
            <a
              href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=623-12029&mode=design&t=ZVq51pKdIKdWZicO-4"
              rel="noopener noreferrer"
              target="_blank"
              title="Figma Designs"
              className={styles.figmaLink}
            >
              <FigmaColorLogo />
            </a>
          </div>
          <TextField
            placeholder="I am a placeholder"
            label="I am a textfield title"
            helpContent="I can be of help to textfield"
            required
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            TextArea
            <a
              href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4"
              rel="noopener noreferrer"
              target="_blank"
              title="Figma Designs"
              className={styles.figmaLink}
            >
              <FigmaColorLogo />
            </a>
          </div>
          <TextArea
            placeholder="I am a placeholder for textarea"
            label="I am a textarea title"
            helpContent="I can be of help to textarea"
            required
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            LimitedTextArea
            <a
              href="https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-4"
              rel="noopener noreferrer"
              target="_blank"
              title="Figma Designs"
              className={styles.figmaLink}
            >
              <FigmaColorLogo />
            </a>
          </div>
          <LimitedTextArea
            maxChars={500}
            label="Limited text area"
            value={limitedText}
            setValue={setLimitedText}
          />
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            Select
            <a
              href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=34-5720&mode=design&t=ZVq51pKdIKdWZicO-4"
              rel="noopener noreferrer"
              target="_blank"
              title="Figma Designs"
              className={styles.figmaLink}
            >
              <FigmaColorLogo />
            </a>
          </div>
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
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Switch
              <a
                href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=194-3449&mode=design&t=ZVq51pKdIKdWZicO-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
            <ul>
              <li>
                <Select
                  label="Label Placement"
                  onChange={onChangeSwitchLabelPlacement}
                >
                  <option value="top">top (default)</option>
                  <option value="bottom">bottom</option>
                  <option value="start">start</option>
                  <option value="end">end</option>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={switchesDisabled}
                  onChange={() => setSwitchesDisabled(!switchesDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={switchesHelp}
                  onChange={() => setSwitchesHelp(!switchesHelp)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants}>
            <SwitchComponent
              label="I am a switch label"
              labelPlacement={switchLabelPlacement}
              helperContent={switchesHelp ? 'I can help switches' : null}
              checked={switched}
              disabled={switchesDisabled}
              onChange={() => setSwitchExample(!switched)}
            />
          </div>
        </div>
      </section>
      <section id="sandbox-chips">
        <h6>Chips</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Chip
              <a
                href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Removable"
                  labelPlacement="top"
                  checked={chipRemovable}
                  onChange={() => setChipRemovable(!chipRemovable)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants}>
            <Chip
              label="Tag Name"
              onRemove={chipRemovable ? () => {} : null}
            />
          </div>
        </div>
      </section>
      <section id="sandbox-cards">
        <h6>Media Cards</h6>
        <div className={styles.componentWrapper}>
          <Card
            title="Moby-Dick; or, The Whale."
            description="Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can."
            footer="I still haven't finished this"
            tag="Novel"
          />
        </div>
      </section>
      <section id="sandbox-tags">
        <h6>Tags</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              TagList
              <a
                href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Read Only"
                  labelPlacement="top"
                  checked={tagsReadOnly}
                  onChange={() => setTagsReadOnly(!tagsReadOnly)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Max 5 Tags"
                  labelPlacement="top"
                  checked={maxTags}
                  onChange={() => setMaxTags(!maxTags)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Fixed Width (300px)"
                  labelPlacement="top"
                  checked={tagsFixedWidth}
                  onChange={() => setTagsFixedWidth(!tagsFixedWidth)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants}>
            <div className={cx(
              {
                [styles['fixed-width-tags']]: tagsFixedWidth,
              })
            }
            >
              <TagList
                readOnly={tagsReadOnly}
                tags={tags}
                setTags={setTags}
                maxTags={maxTags ? 5 : undefined}
              />
            </div>
          </div>
        </div>
      </section>
      <section id="sandbox-alerts-prompts">
        <h6>Alerts &amp; Prompts</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Alert
              <a
                href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=4-45716&mode=design&t=G3fBIdgR6AWtOlNu-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
            <ul>
              <li>
                <Select
                  label="Variant"
                  onChange={onChangeAlertVariant}
                >
                  <option value="info">info</option>
                  <option value="success">success</option>
                  <option value="warning">warning</option>
                  <option value="error">error</option>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="Title"
                  labelPlacement="top"
                  checked={alertTitle}
                  onChange={() => setAlertTitle(!alertTitle)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Content"
                  labelPlacement="top"
                  checked={alertContent}
                  onChange={() => setAlertContent(!alertContent)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Icon"
                  labelPlacement="top"
                  checked={alertIcon}
                  onChange={() => setAlertIcon(!alertIcon)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Button"
                  labelPlacement="top"
                  checked={alertButton}
                  onChange={() => setAlertButton(!alertButton)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Floating"
                  labelPlacement="top"
                  checked={alertFloating}
                  onChange={() => setAlertFloating(!alertFloating)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Closable"
                  labelPlacement="top"
                  checked={alertClosable}
                  onChange={() => setAlertClosable(!alertClosable)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants}>
            <Alert
              title={alertTitle && <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>}
              floating={alertFloating}
              icon={alertIcon}
              buttonLabel={alertButton && <span>alert action</span>}
              content={alertContent && <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</span>}
              variant={alertVariant}
              onClose={alertClosable ? () => {} : null}
            />
          </div>
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
