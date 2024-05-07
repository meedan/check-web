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
import ListSort from './cds/inputs/ListSort';
import TextArea from './cds/inputs/TextArea';
import DatePicker from './cds/inputs/DatePicker';
import LanguagePickerSelect from './cds/inputs/LanguagePickerSelect';
import Time from './cds/inputs/Time';
import { ToggleButton, ToggleButtonGroup } from './cds/inputs/ToggleButtonGroup';
import Select from './cds/inputs/Select';
import SwitchComponent from './cds/inputs/SwitchComponent';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import Checkbox from './cds/buttons-checkboxes-chips/Checkbox';
import Reorder from './layout/Reorder';
import AddIcon from '../icons/settings.svg';
import CalendarIcon from '../icons/calendar_month.svg';
import ListIcon from '../icons/list.svg';
import FigmaColorLogo from '../icons/figma_color.svg';
import FactCheckCard from './search/SearchResultsCards/FactCheckCard';
import LimitedTextArea from './layout/inputs/LimitedTextArea';
import MediasLoading from './media/MediasLoading';
import ParsedText from './ParsedText';
import SharedItemCard from './search/SearchResultsCards/SharedItemCard';
import WorkspaceItemCard from './search/SearchResultsCards/WorkspaceItemCard';
import ItemThumbnail from './search/SearchResultsTable/ItemThumbnail';
import CheckFeedDataPoints from '../CheckFeedDataPoints';
import Slideout from './cds/slideout/Slideout';

const SandboxComponent = ({ admin }) => {
  const isAdmin = admin?.is_admin;
  if (!isAdmin) {
    return null;
  }

  const [tags, setTags] = React.useState([
    'first',
    'second',
    'Third is Quite Long Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sapien tellus, pretium sed bibendum in, bibendum quis metus. Donec tincidunt justo urna, vel laoreet urna consectetur fermentum. Pellentesque et lectus dictum, dapibus leo at, semper augue. Sed quis tellus eu ipsum rutrum ultrices non id magna.',
    'fourth',
    'fifth!',
    'This is Six',
  ]);

  const mediaThumbnail = {
    media: {
      picture: 'https://placekitten.com/200/300',
      type: 'UploadedImage',
      url: 'https://placekitten.com/200/300',
    },
    show_warning_cover: false,
  };

  const workspaces = [
    {
      url: 'https://placekitten.com/200/200',
      name: 'First Workspace',
    },
    {
      url: 'https://placekitten.com/300/300',
      name: 'Second Workspace',
    },
    {
      url: 'https://placekitten.com/301/300',
      name: 'Third Workspace',
    },
    {
      url: 'https://placekitten.com/302/300',
      name: 'Fourth Workspace',
    },
    {
      url: 'https://placekitten.com/303/300',
      name: 'Fifth Workspace',
    },
    {
      url: 'https://placekitten.com/304/300',
      name: 'Sixth Workspace',
    },
    {
      url: 'https://placekitten.com/305/300',
      name: 'Seventh Workspace',
    },
    {
      url: 'https://placekitten.com/306/300',
      name: 'Eighth Workspace',
    },
  ];

  const [listItemShared, setListItemShared] = React.useState(Boolean(false));
  const [listItemCluster, setListItemCluster] = React.useState(Boolean(false));
  const [listItemMedia, setListItemMedia] = React.useState(Boolean(true));
  const [listItemRequests, setListItemRequests] = React.useState(Boolean(true));
  const [listItemFactCheck, setListItemFactCheck] = React.useState(Boolean(true));
  const [listItemFactCheckLink, setListItemFactCheckLink] = React.useState(Boolean(true));
  const [listItemDescriptionLink, setListItemDescriptionLink] = React.useState(Boolean(true));
  const [listItemDescription, setListItemDescription] = React.useState(Boolean(true));
  const [listItemFactCheckPublished, setListItemFactCheckPublished] = React.useState(Boolean(true));
  const [listItemSuggestions, setListItemSuggestions] = React.useState(Boolean(true));
  const [listItemUnread, setListItemUnread] = React.useState(Boolean(true));
  const [listItemPublished, setListItemPublished] = React.useState(Boolean(true));
  const [listItemDataPointsFactCheck, setListItemDataPointsFactCheck] = React.useState(Boolean(false));
  const [listItemDataPointsMediaRequests, setListItemDataPointsMediaRequests] = React.useState(Boolean(false));
  const [listItemDataPoints, setListItemDataPoints] = React.useState([]);
  const [listItemFactCheckCount, setListItemFactCheckCount] = React.useState(1);

  // This triggers when the list item data points are changed
  React.useEffect(() => {
    if (listItemDataPointsFactCheck && listItemDataPointsMediaRequests) {
      setListItemDataPoints([CheckFeedDataPoints.PUBLISHED_FACT_CHECKS, CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS]);
    } else if (!listItemDataPointsFactCheck && listItemDataPointsMediaRequests) {
      setListItemDataPoints([CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS]);
    } else if (listItemDataPointsFactCheck && !listItemDataPointsMediaRequests) {
      setListItemDataPoints([CheckFeedDataPoints.PUBLISHED_FACT_CHECKS]);
    } else if (!listItemDataPointsFactCheck && !listItemDataPointsMediaRequests) {
      setListItemDataPoints([]);
    }
  }, [listItemDataPointsFactCheck, listItemDataPointsMediaRequests]);

  const onSetListItemShared = (shared) => {
    if (!listItemCluster) {
      setListItemDescriptionLink(false);
      setListItemRequests(false);
      setListItemMedia(false);
    }
    setListItemSuggestions(false);
    setListItemUnread(false);
    setListItemFactCheck(true);
    setListItemFactCheckPublished(true);
    setListItemShared(shared);
  };

  const onSetListItemCluster = (cluster) => {
    if (cluster) {
      setListItemRequests(true);
      setListItemMedia(true);
    } else {
      setListItemDescriptionLink(false);
      setListItemFactCheck(true);
      setListItemFactCheckPublished(true);
      setListItemRequests(false);
      setListItemMedia(false);
    }
    setListItemCluster(cluster);
  };

  const onSetListItemMedia = (media) => {
    if (media && listItemShared && listItemCluster) {
      setListItemRequests(true);
    } else if (!media && listItemShared && listItemCluster) {
      setListItemRequests(false);
    }
    setListItemMedia(media);
  };

  const onSetListItemRequests = (requests) => {
    if (requests && listItemShared && listItemCluster) {
      setListItemMedia(true);
    } else if (!requests && listItemShared && listItemCluster) {
      setListItemMedia(false);
    }
    setListItemRequests(requests);
  };

  const onSetListItemFactCheck = (factcheck) => {
    if (!factcheck && listItemShared) {
      setListItemFactCheckLink(false);
      setListItemFactCheckPublished(false);
    } else if (factcheck && listItemShared) {
      setListItemFactCheckPublished(true);
    } else if (!factcheck) {
      setListItemFactCheckLink(false);
      setListItemFactCheckPublished(false);
    }
    setListItemFactCheck(factcheck);
  };

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

  const [reorderFirst, setReorderFirst] = React.useState(Boolean(false));
  const [reorderLast, setReorderLast] = React.useState(Boolean(false));

  const [switchesDisabled, setSwitchesDisabled] = React.useState(Boolean(false));
  const [switchesHelp, setSwitchesHelp] = React.useState(Boolean(false));
  const [switched, setSwitchExample] = React.useState(Boolean(false));

  const [textfieldLabel, setTextfieldLabel] = React.useState(Boolean(true));
  const [textfieldIconLeft, setTextfieldIconLeft] = React.useState(Boolean(false));
  const [textfieldIconRight, setTextfieldIconRight] = React.useState(Boolean(false));
  const [textfieldHelp, setTextfieldHelp] = React.useState(Boolean(true));
  const [textfieldError, setTextfieldError] = React.useState(Boolean(false));
  const [textfieldDisabled, setTextfieldDisabled] = React.useState(Boolean(false));
  const [textfieldRequired, setTextfieldRequired] = React.useState(Boolean(true));
  const [textfieldRemovable, setTextfieldRemovable] = React.useState(Boolean(true));
  const [textfieldContent, setTextfieldContent] = React.useState('');

  const [toggleButtonGroupLabel, setToggleButtonGroupLabel] = React.useState(Boolean(true));
  const [toggleButtonGroupHelp, setToggleButtonGroupHelp] = React.useState(Boolean(true));
  const [toggleButtonGroupDisabled, setToggleButtonGroupDisabled] = React.useState(Boolean(false));

  const [timeLabel, setTimeLabel] = React.useState(Boolean(false));
  const [timeHelp, setTimeHelp] = React.useState(Boolean(false));
  const [timeError, setTimeError] = React.useState(Boolean(false));
  const [timeDisabled, setTimeDisabled] = React.useState(Boolean(false));

  const [datepickerLabel, setDatepickerLabel] = React.useState(Boolean(false));
  const [datepickerHelp, setDatepickerHelp] = React.useState(Boolean(false));
  const [datepickerError, setDatepickerError] = React.useState(Boolean(false));
  const [datepickerDisabled, setDatepickerDisabled] = React.useState(Boolean(false));

  const [languagePickerSelectLabel, setLanguagePickerSelectLabel] = React.useState(Boolean(true));
  const [languagePickerSelectDisabled, setLanguagePickerSelectDisabled] = React.useState(Boolean(false));
  const [languagePickerSelectHelp, setLanguagePickerSelectHelp] = React.useState(Boolean(false));

  const [checkboxLabel, setCheckboxLabel] = React.useState(Boolean(true));
  const [checkboxDisabled, setCheckboxDisabled] = React.useState(Boolean(false));
  const [checkboxChecked, setCheckboxChecked] = React.useState(Boolean(false));

  const [selectLabel, setSelectLabel] = React.useState(Boolean(true));
  const [selectIconLeft, setSelectIconLeft] = React.useState(Boolean(true));
  const [selectHelp, setSelectHelp] = React.useState(Boolean(true));
  const [selectError, setSelectError] = React.useState(Boolean(false));
  const [selectDisabled, setSelectDisabled] = React.useState(Boolean(false));
  const [selectRequired, setSelectRequired] = React.useState(Boolean(true));
  const [selectRemovable, setSelectRemovable] = React.useState(Boolean(true));

  const [limitedText, setLimitedText] = React.useState('DRF envisions a place where all people, and especially women, are able to exercise their right of expression without being threatened. We believe that free internet with access to information and impeccable privacy policies can encourage such a healthy and productive environment that would eventually help not only women, but the world at large. \n Digital Rights Foundation aims to strengthen protections for human rights defenders (HRDs), with a focus on women\'s rights, in digital spaces through policy advocacy & digital security awareness-raising. In addition, one of our aims at the Foundation is also to protect women from work and cyber-harassment that they have to deal with through out their lives.');
  const [textareaLabel, setTextareaLabel] = React.useState(Boolean(true));
  const [textareaHelp, setTextareaHelp] = React.useState(Boolean(true));
  const [textareaError, setTextareaError] = React.useState(Boolean(false));
  const [textareaAutogrow, setTextareaAutogrow] = React.useState(Boolean(true));
  const [textareaLimited, setTextareaLimited] = React.useState(Boolean(false));
  const [textareaDisabled, setTextareaDisabled] = React.useState(Boolean(false));
  const [textareaRequired, setTextareaRequired] = React.useState(Boolean(true));

  const [slideoutTitle, setSlideoutTitle] = React.useState('');
  const [openSlideout, setOpenSlideout] = React.useState(Boolean(false));
  const [slideoutFooter, setSlideoutFooter] = React.useState(Boolean(true));
  const [slideoutCancel, setSlideoutCancel] = React.useState(Boolean(true));
  const [slideoutMainAction, setSlideoutMainAction] = React.useState(Boolean(true));
  const [slideoutSecondaryAction, setSlideoutSecondaryAction] = React.useState(Boolean(false));
  const [slideoutOptionalNode, setSlideoutOptionalNode] = React.useState(Boolean(false));

  const [switchLabelPlacement, setSwitchLabelPlacement] = React.useState('top');
  const onChangeSwitchLabelPlacement = (event) => {
    setSwitchLabelPlacement(event.target.value);
  };

  const [loadingTheme, setLoadingTheme] = React.useState('grey');
  const onChangeLoadingTheme = (event) => {
    setLoadingTheme(event.target.value);
  };

  const [loadingSize, setLoadingSize] = React.useState('large');
  const onChangeLoadingSize = (event) => {
    setLoadingSize(event.target.value);
  };

  const [loadingVariant, setLoadingVariant] = React.useState('inline');
  const onChangeLoadingVariant = (event) => {
    setLoadingVariant(event.target.value);
  };

  const [alertVariant, setAlertVariant] = React.useState('info');
  const onChangeAlertVariant = (event) => {
    setAlertVariant(event.target.value);
  };

  const [toggleButtonGroupVariant, setToggleButtonGroupVariant] = React.useState('contained');
  const onChangeToggleButtonGroupVariant = (event) => {
    setToggleButtonGroupVariant(event.target.value);
  };

  const [toggleButtonGroupValue, setToggleButtonGroupValue] = React.useState('1');
  const changeToggleButtonGroupExample = (event) => {
    setToggleButtonGroupValue(event);
  };

  const [toggleButtonGroupSize, setToggleButtonGroupSize] = React.useState('default');
  const onChangeToggleButtonGroupSize = (event) => {
    setToggleButtonGroupSize(event.target.value);
  };

  const [alertPlacement, setAlertPlacement] = React.useState('default');
  const onChangeAlertPlacement = (event) => {
    setAlertPlacement(event.target.value);
  };

  const [buttonVariant, setButtonVariant] = React.useState('contained');
  const onChangeButtonVariant = (event) => {
    setButtonVariant(event.target.value);
  };

  const [reorderVariant, setReorderVariant] = React.useState('vertical');
  const onChangeReorderVariant = (event) => {
    setReorderVariant(event.target.value);
  };

  const [textareaRows, setTextareaRows] = React.useState('none');
  const onChangeTextareaRows = (event) => {
    setTextareaRows(event.target.value);
  };

  const [textareaMaxHeight, setTextareaMaxHeight] = React.useState('none');
  const onChangeTextareaMaxHeight = (event) => {
    setTextareaMaxHeight(event.target.value);
  };

  const [buttonSize, setButtonSize] = React.useState('default');
  const onChangeButtonSize = (event) => {
    setButtonSize(event.target.value);
  };

  const [buttonTheme, setButtonTheme] = React.useState('brand');
  const onChangeButtonTheme = (event) => {
    setButtonTheme(event.target.value);
  };

  const [reorderTheme, setReorderTheme] = React.useState('gray');
  const onChangeReorderTheme = (event) => {
    setReorderTheme(event.target.value);
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
      },
      user: {
        windowSize: {
          height: window.screen.availHeight,
          width: window.screen.availWidth,
        },
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
        <li>
          <a href="#sandbox-text-display" title="Text Display">Text Display</a>
        </li>
        <li>
          <a href="#sandbox-loaders" title="Loaders">Loading Animations</a>
        </li>
        <li>
          <a href="#sandbox-slideout" title="Slideout">Slideout</a>
        </li>
      </ul>
      <section id="sandbox-row">
        <h6>List Item</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              ListItem
              <a
                href="https://www.figma.com/file/N1W1p7anE8xxekD7EyepVE/Shared-Feeds?type=design&node-id=2411-37415&mode=design"
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
                  label="Shared Feed"
                  labelPlacement="top"
                  checked={listItemShared}
                  onChange={() => onSetListItemShared(!listItemShared)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Cluster of Media"
                  labelPlacement="top"
                  checked={listItemCluster}
                  disabled={!listItemShared}
                  onChange={() => onSetListItemCluster(!listItemCluster)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Media"
                  labelPlacement="top"
                  checked={listItemMedia}
                  disabled={listItemShared && !listItemCluster}
                  onChange={() => onSetListItemMedia(!listItemMedia)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Requests"
                  labelPlacement="top"
                  checked={listItemRequests}
                  disabled={listItemShared && !listItemCluster}
                  onChange={() => onSetListItemRequests(!listItemRequests)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Description"
                  labelPlacement="top"
                  checked={listItemDescription}
                  onChange={() => setListItemDescription(!listItemDescription)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Fact-Check"
                  labelPlacement="top"
                  checked={listItemFactCheck}
                  disabled={listItemShared && !listItemCluster}
                  onChange={() => onSetListItemFactCheck(!listItemFactCheck)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Fact-Check Published"
                  labelPlacement="top"
                  checked={listItemFactCheckPublished}
                  disabled={!listItemFactCheck || listItemShared}
                  onChange={() => setListItemFactCheckPublished(!listItemFactCheckPublished)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Fact-Check Link"
                  labelPlacement="top"
                  checked={listItemFactCheckLink}
                  disabled={!listItemFactCheck}
                  onChange={() => setListItemFactCheckLink(!listItemFactCheckLink)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Description Link"
                  labelPlacement="top"
                  checked={listItemDescriptionLink}
                  disabled={listItemShared && !listItemCluster}
                  onChange={() => setListItemDescriptionLink(!listItemDescriptionLink)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Suggestions"
                  labelPlacement="top"
                  checked={listItemSuggestions}
                  disabled={listItemShared}
                  onChange={() => setListItemSuggestions(!listItemSuggestions)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Unread"
                  labelPlacement="top"
                  checked={listItemUnread}
                  disabled={listItemShared}
                  onChange={() => setListItemUnread(!listItemUnread)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Published"
                  labelPlacement="top"
                  checked={listItemPublished}
                  onChange={() => setListItemPublished(!listItemPublished)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Shared Feed Data Points - Fact Checks"
                  labelPlacement="top"
                  checked={listItemDataPointsFactCheck}
                  disabled={!listItemShared}
                  onChange={() => setListItemDataPointsFactCheck(!listItemDataPointsFactCheck)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Shared Feed Data Points - Media & Requests"
                  labelPlacement="top"
                  checked={listItemDataPointsMediaRequests}
                  disabled={!listItemShared}
                  onChange={() => setListItemDataPointsMediaRequests(!listItemDataPointsMediaRequests)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Fact Check Count - More than 1"
                  labelPlacement="top"
                  checked={listItemFactCheckCount > 1}
                  onChange={() => {
                    if (listItemFactCheckCount === 1) {
                      setListItemFactCheckCount(12345);
                    } else {
                      setListItemFactCheckCount(1);
                    }
                  }}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <SharedItemCard
              title="Title of a Shared Item Card Item"
              description={listItemDescription && 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.'}
              mediaThumbnail={listItemCluster && mediaThumbnail}
              workspaces={workspaces}
              date={new Date('2023-12-15T17:19:40Z')}
              dataPoints={listItemDataPoints}
              mediaCount={12345}
              suggestionsCount={567890}
              requestsCount={7890}
              lastRequestDate={new Date('2024-01-15T12:00:22Z')}
              factCheckUrl={listItemFactCheckLink && 'https://example.com/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it'}
              factCheckCount={listItemFactCheckCount}
              channels={listItemRequests && { main: 8, others: [5, 8, 7, 6, 9, 10, 13] }}
              rating="False"
              ratingColor="#f00"
            />
            <WorkspaceItemCard
              title="Title of a Workspace Item Card Item"
              date={new Date('2023-12-15T17:19:40Z')}
              description={listItemDescription && 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.'}
              lastRequestDate={new Date('2024-01-15T12:00:22Z')}
              mediaCount={123456}
              mediaType="UploadedImage"
              mediaThumbnail={listItemMedia && mediaThumbnail}
              channels={listItemRequests && { main: 8, others: [5, 8, 7, 6, 9, 10, 13] }}
              requestsCount={7890}
              isUnread={listItemUnread}
              isPublished={listItemPublished}
              factCheckUrl={listItemFactCheckLink && 'https://example.com/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it'}
              rating="False"
              ratingColor="#f00"
              suggestionsCount={567890}
            />
            <div
              className={cx(
                styles.listItem,
                {
                  [styles.listItemUnread]: listItemUnread && !listItemShared,
                })
              }
            >
              { !listItemShared &&
                <div className={styles.checkbox}>
                  <Checkbox
                    disabled={checkboxDisabled}
                    checked={checkboxChecked}
                    onChange={() => setCheckboxChecked(!checkboxChecked)}
                  />
                </div>
              }
              { ((listItemMedia && !listItemShared) || (listItemShared && listItemCluster)) &&
              <>
                <div className={styles.thumbail}>
                  <ItemThumbnail picture={mediaThumbnail.media?.picture} maskContent={mediaThumbnail.show_warning_cover} type={mediaThumbnail.media?.type} url={mediaThumbnail.media?.url} />
                </div>
              </>
              }
              <div className={styles.content}>
                <h6>Item Title</h6>
                { listItemDescription &&
                  <p>
                    DESCRIPTION
                  </p>
                }
                { listItemDescriptionLink &&
                  <a href="www.meedan.com" className={styles.factDescriptionLink}>
                    DESCRIPTION LINK
                  </a>
                }
                { listItemFactCheckLink &&
                  <a href="www.meedan.com" className={styles.factCheckLink}>
                    FACT-CHECK LINK
                  </a>
                }
                { listItemShared &&
                  <div className={styles.workspaces}>
                    WORKPACES
                  </div>
                }
                <div className={styles.mediaAndRequest}>
                  { listItemMedia ? <div>MEDIA</div> : null }
                  { listItemSuggestions ? <div>SUGGESTIONS</div> : null }
                  { listItemRequests ? <div>REQUESTS</div> : null }
                  { listItemRequests ? <div>PLATFORMS</div> : null }
                </div>
              </div>
              <div className={styles.factCheckLastUpdated}>
                <div className={styles.factCheck}>
                  { listItemShared && listItemFactCheck &&
                    <>FACT-CHECK COUNT</>
                  }
                  { !listItemShared && listItemFactCheck &&
                    <>WORKSPACE FACT-CHECK</>
                  }
                  { listItemFactCheckPublished && !listItemShared ? <>PUBLISHED</> : null }
                </div>
                May 27, 2022
              </div>
            </div>
          </div>
        </div>
      </section>
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
                  value={buttonVariant}
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
                  value={buttonSize}
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
                  value={buttonTheme}
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
                  <optgroup label="primary">
                    <option value="black">black</option>
                    <option value="white">white</option>
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
          <div className={styles.componentInlineVariants} style={{ backgroundColor: buttonTheme === 'white' ? 'var(--textPrimary)' : null }}>
            <ButtonMain label="Default" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconLeft={<AddIcon />} label="Left" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconRight={<AddIcon />} label="Right" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain iconCenter={<AddIcon />} label="Center" variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Reorder
              <a
                href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=2142-47843&mode=design&t=Xk5LFyi7pmsXEX1T-4"
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
                  onChange={onChangeReorderVariant}
                  value={reorderVariant}
                >
                  <option value="vertical">vertical (default)</option>
                  <option value="horizontal">horizontal</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Theme"
                  onChange={onChangeReorderTheme}
                  value={reorderTheme}
                >
                  <option value="gray">gray (default)</option>
                  <option value="white">white</option>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="First"
                  labelPlacement="top"
                  checked={reorderFirst}
                  onChange={() => setReorderFirst(!reorderFirst)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Last"
                  labelPlacement="top"
                  checked={reorderLast}
                  onChange={() => setReorderLast(!reorderLast)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentInlineVariants} style={{ backgroundColor: reorderTheme === 'white' ? 'var(--grayBackground)' : 'var(--otherWhite' }}>
            <Reorder
              variant={reorderVariant}
              theme={reorderTheme}
              disableUp={reorderFirst}
              disableDown={reorderLast}
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={cx('typography-subtitle2', [styles.componentName])}>
            Trigger Sentry error
          </div>
          <div className={styles.componentInlineVariants}>
            <ButtonMain label="Trigger Sentry" onClick={generateUncaughtError} variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
            <ButtonMain label="Sentry manual error" onClick={generateManualError} variant={buttonVariant} size={buttonSize} theme={buttonTheme} disabled={buttonDisabled} />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
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
            <ul>
              <li>
                <Select
                  label="Size"
                  onChange={onChangeToggleButtonGroupSize}
                  value={toggleButtonGroupSize}
                >
                  <option value="default">default</option>
                  <option value="small">small</option>
                  <option value="large">large</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Variant"
                  onChange={onChangeToggleButtonGroupVariant}
                  value={toggleButtonGroupVariant}
                >
                  <option value="contained">contained</option>
                  <option value="outlined">outlined</option>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={toggleButtonGroupLabel}
                  onChange={() => setToggleButtonGroupLabel(!toggleButtonGroupLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={toggleButtonGroupHelp}
                  onChange={() => setToggleButtonGroupHelp(!toggleButtonGroupHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={toggleButtonGroupDisabled}
                  onChange={() => setToggleButtonGroupDisabled(!toggleButtonGroupDisabled)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants} style={{ backgroundColor: 'var(--brandBackground' }}>
            <ToggleButtonGroup
              label={toggleButtonGroupLabel ? 'I am a toggleButtonGroup label' : null}
              variant={toggleButtonGroupVariant}
              helpContent={toggleButtonGroupHelp ? 'I can be of help to ToggleButtonGroup' : null}
              value={toggleButtonGroupValue}
              onChange={(e, newValue) => changeToggleButtonGroupExample(newValue)}
              size={toggleButtonGroupSize}
              exclusive
            >
              <ToggleButton value="1" key="1" disabled={toggleButtonGroupDisabled}>
                One
              </ToggleButton>
              <ToggleButton value="2" key="2" disabled={toggleButtonGroupDisabled}>
                Two
              </ToggleButton>
              <ToggleButton value="3" key="3" disabled={toggleButtonGroupDisabled}>
                Three
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
      </section>
      <section id="sandbox-inputs">
        <h6>Inputs</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
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
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={textfieldLabel}
                  onChange={() => setTextfieldLabel(!textfieldLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Icon Left"
                  labelPlacement="top"
                  checked={textfieldIconLeft}
                  onChange={() => setTextfieldIconLeft(!textfieldIconLeft)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Icon Right"
                  labelPlacement="top"
                  checked={textfieldIconRight}
                  onChange={() => setTextfieldIconRight(!textfieldIconRight)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={textfieldHelp}
                  onChange={() => setTextfieldHelp(!textfieldHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={textfieldDisabled}
                  onChange={() => setTextfieldDisabled(!textfieldDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Required"
                  labelPlacement="top"
                  checked={textfieldRequired}
                  onChange={() => setTextfieldRequired(!textfieldRequired)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Error"
                  labelPlacement="top"
                  checked={textfieldError}
                  onChange={() => setTextfieldError(!textfieldError)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Removable"
                  labelPlacement="top"
                  checked={textfieldRemovable}
                  onChange={() => setTextfieldRemovable(!textfieldRemovable)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <TextField
              label={textfieldLabel ? 'I am a textfield title' : null}
              required={textfieldRequired}
              placeholder="I am a placeholder for textfield"
              iconLeft={textfieldIconLeft ? <ListIcon /> : null}
              iconRight={textfieldIconRight ? <CalendarIcon /> : null}
              helpContent={textfieldHelp ? 'I can be of help to textfield' : null}
              disabled={textfieldDisabled}
              error={textfieldError}
              value={textfieldContent}
              onChange={e => setTextfieldContent(e.target.value)}
              onRemove={textfieldRemovable ? () => { setTextfieldContent(''); } : null}
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
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
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={selectLabel}
                  onChange={() => setSelectLabel(!selectLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Icon Left"
                  labelPlacement="top"
                  checked={selectIconLeft}
                  onChange={() => setSelectIconLeft(!selectIconLeft)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={selectHelp}
                  onChange={() => setSelectHelp(!selectHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={selectDisabled}
                  onChange={() => setSelectDisabled(!selectDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Required"
                  labelPlacement="top"
                  checked={selectRequired}
                  onChange={() => setSelectRequired(!selectRequired)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Error"
                  labelPlacement="top"
                  checked={selectError}
                  onChange={() => setSelectError(!selectError)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Removable"
                  labelPlacement="top"
                  checked={selectRemovable}
                  onChange={() => setSelectRemovable(!selectRemovable)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <Select
              label={selectLabel ? 'I am a select title' : null}
              required={selectRequired}
              iconLeft={selectIconLeft ? <ListIcon /> : null}
              helpContent={selectHelp ? 'I can be of help to select' : null}
              disabled={selectDisabled}
              error={selectError}
              onRemove={selectRemovable ? () => {} : null}
            >
              <option hidden>Select...</option>
              <option value="1">one</option>
              <option value="2">two</option>
              <option value="3">three</option>
            </Select>
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
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
            <ul>
              <li>
                <Select
                  label="Row Count"
                  onChange={onChangeTextareaRows}
                  value={textareaRows}
                >
                  <option value="none">none</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Max height"
                  onChange={onChangeTextareaMaxHeight}
                  value={textareaMaxHeight}
                >
                  <option value="none">none</option>
                  <option value="48px">48px</option>
                  <option value="96px">96px</option>
                  <option value="180px">180px</option>
                  <option value="360px">360px</option>
                  <option value="500px">500px</option>
                </Select>
              </li>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={textareaLabel}
                  onChange={() => setTextareaLabel(!textareaLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="AutoGrow"
                  labelPlacement="top"
                  checked={textareaAutogrow}
                  onChange={() => setTextareaAutogrow(!textareaAutogrow)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Limit Character Count"
                  labelPlacement="top"
                  checked={textareaLimited}
                  onChange={() => setTextareaLimited(!textareaLimited)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={textareaHelp}
                  onChange={() => setTextareaHelp(!textareaHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={textareaDisabled}
                  onChange={() => setTextareaDisabled(!textareaDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Required"
                  labelPlacement="top"
                  checked={textareaRequired}
                  onChange={() => setTextareaRequired(!textareaRequired)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Error"
                  labelPlacement="top"
                  checked={textareaError}
                  onChange={() => setTextareaError(!textareaError)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            { textareaLimited ?
              <LimitedTextArea
                maxChars={500}
                setValue={setLimitedText}
                placeholder="I am a placeholder for limited textarea"
                label={textareaLabel ? 'I am a limited textarea title' : null}
                value={limitedText}
                helpContent={textareaHelp ? 'I can be of help to limited textarea' : null}
                autoGrow={textareaAutogrow}
                rows={textareaRows === 'none' ? undefined : textareaRows}
                required={textareaRequired}
                disabled={textareaDisabled}
                maxHeight={textareaMaxHeight === 'none' ? undefined : textareaMaxHeight}
              />
              :
              <TextArea
                placeholder="I am a placeholder for textarea"
                label={textareaLabel ? 'I am a textarea title' : null}
                helpContent={textareaHelp ? 'I can be of help to textarea' : null}
                autoGrow={textareaAutogrow}
                rows={textareaRows === 'none' ? undefined : textareaRows}
                required={textareaRequired}
                disabled={textareaDisabled}
                maxHeight={textareaMaxHeight === 'none' ? undefined : textareaMaxHeight}
                error={textareaError}
              />
            }
          </div>
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
                  value={switchLabelPlacement}
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
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              List Sort
              <a
                href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=1475-46077&mode=design&t=GXBsN674hkLPLGfM-4"
                rel="noopener noreferrer"
                target="_blank"
                title="Figma Designs"
                className={styles.figmaLink}
              >
                <FigmaColorLogo />
              </a>
            </div>
          </div>
          <div className={styles.componentBlockVariants}>
            <ListSort
              sortType="DESC"
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Time
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={timeLabel}
                  onChange={() => setTimeLabel(!timeLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={timeHelp}
                  onChange={() => setTimeHelp(!timeHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={timeDisabled}
                  onChange={() => setTimeDisabled(!timeDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Error"
                  labelPlacement="top"
                  checked={timeError}
                  onChange={() => setTimeError(!timeError)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <Time
              label={timeLabel ? 'I am a time label' : null}
              error={timeError}
              value="09:00"
              helpContent={timeHelp ? 'I can be of help to time' : null}
              disabled={timeDisabled}
              required
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              DatePicker
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={datepickerLabel}
                  onChange={() => setDatepickerLabel(!datepickerLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={datepickerHelp}
                  onChange={() => setDatepickerHelp(!datepickerHelp)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={datepickerDisabled}
                  onChange={() => setDatepickerDisabled(!datepickerDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Error"
                  labelPlacement="top"
                  checked={datepickerError}
                  onChange={() => setDatepickerError(!datepickerError)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <DatePicker
              label={datepickerLabel ? 'I am a datepicker label' : null}
              value="2023-12-17"
              error={datepickerError}
              helpContent={datepickerHelp ? 'I can be of help to datepicker' : null}
              disabled={datepickerDisabled}
              required
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              LanguagePickerSelect
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={languagePickerSelectLabel}
                  onChange={() => setLanguagePickerSelectLabel(!languagePickerSelectLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={languagePickerSelectDisabled}
                  onChange={() => setLanguagePickerSelectDisabled(!languagePickerSelectDisabled)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Help"
                  labelPlacement="top"
                  checked={languagePickerSelectHelp}
                  onChange={() => setLanguagePickerSelectHelp(!languagePickerSelectHelp)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <LanguagePickerSelect
              selectedLanguage="en"
              languages={JSON.parse('["en", "af", "zn"]')}
              label={languagePickerSelectLabel ? 'I am a LanguagePickerSelect label' : null}
              isDisabled={languagePickerSelectDisabled}
              helpContent={languagePickerSelectHelp ? 'I can be of help to LanguagePickerSelect' : null}
            />
          </div>
        </div>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Checkbox
            </div>
            <ul>
              <li>
                <SwitchComponent
                  label="Label"
                  labelPlacement="top"
                  checked={checkboxLabel}
                  onChange={() => setCheckboxLabel(!checkboxLabel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Disabled"
                  labelPlacement="top"
                  checked={checkboxDisabled}
                  onChange={() => setCheckboxDisabled(!checkboxDisabled)}
                />
              </li>
            </ul>
          </div>
          <div className={styles.componentBlockVariants}>
            <Checkbox
              label={checkboxLabel ? 'I am a Checkbox label' : null}
              disabled={checkboxDisabled}
              checked={checkboxChecked}
              onChange={() => setCheckboxChecked(!checkboxChecked)}
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
          <FactCheckCard
            title="Moby-Dick; or, The Whale."
            statusLabel="The Status"
            statusColor="#ff0000"
            summary="Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can."
            date={1702677106.846}
            url="https://example.com"
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
                  value={alertVariant}
                >
                  <option value="info">info</option>
                  <option value="success">success</option>
                  <option value="warning">warning</option>
                  <option value="error">error</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Placement"
                  onChange={onChangeAlertPlacement}
                  value={alertPlacement}
                >
                  <option value="default">default</option>
                  <option value="floating">floating</option>
                  <option value="banner">banner</option>
                  <option value="contained">contained</option>
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
              contained={alertPlacement === 'contained'}
              banner={alertPlacement === 'banner'}
              floating={alertPlacement === 'floating'}
              icon={alertIcon}
              buttonLabel={alertButton && <span>alert action</span>}
              content={alertContent && <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</span>}
              variant={alertVariant}
              onClose={alertClosable ? () => {} : null}
            />
          </div>
        </div>
      </section>
      <section id="sandbox-text-display">
        <h6>Parsed Text</h6>
        <div className={styles.componentWrapper}>
          <ParsedText
            text="Call me Ishmael. This is my Youtube video: https://www.youtube.com/watch?v=zg84olIrn-k Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. This is an image of the cover of this book: https://upload.wikimedia.org/wikipedia/commons/3/36/Moby-Dick_FE_title_page.jpg Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can."
            fileUrlName=""
            mediaChips
          />
        </div>
      </section>
      <section id="sandbox-loaders">
        <h6>LoadingAnimations</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              MediasLoading
            </div>
            <ul>
              <li>
                <Select
                  label="Size"
                  onChange={onChangeLoadingSize}
                  value={loadingSize}
                >
                  <option value="icon">icon</option>
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                  <option value="large" selected>large</option>
                </Select>
              </li>
              <li>
                <Select
                  label="Theme"
                  onChange={onChangeLoadingTheme}
                  value={loadingTheme}
                >
                  <option value="grey" selected>grey</option>
                  <option value="white">white</option>=
                </Select>
              </li>
              <li>
                <Select
                  label="Variant"
                  onChange={onChangeLoadingVariant}
                >
                  <option value="inline" selected>inline</option>
                  <option value="page">page</option>=
                </Select>
              </li>
            </ul>
          </div>
          <div
            className={cx(
              [styles.componentInlineVariants],
              {
                [styles.componentInlineGreyVariants]: loadingTheme === 'white',
              })
            }
          >
            <MediasLoading theme={loadingTheme} variant={loadingVariant} size={loadingSize} />
          </div>
        </div>
      </section>
      <section id="sandbox-slideout">
        <h6>Slideout</h6>
        <div className={styles.componentWrapper}>
          <div className={styles.componentControls}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Slideout
              <a
                href="https://www.figma.com/file/i1LSbpQXKyA7dLc8AkgtKA/Articles?type=design&node-id=106-63346&mode=design&t=1tA1BlK81Dh6DPCk-0"
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
                <TextField
                  value={slideoutTitle}
                  label="Slideout Title"
                  labelPlacement="top"
                  onChange={e => setSlideoutTitle(e.target.value)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Footer"
                  labelPlacement="top"
                  checked={slideoutFooter}
                  onChange={() => setSlideoutFooter(!slideoutFooter)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Cancel"
                  labelPlacement="top"
                  checked={slideoutCancel}
                  onChange={() => setSlideoutCancel(!slideoutCancel)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Main Button"
                  labelPlacement="top"
                  checked={slideoutMainAction}
                  onChange={() => setSlideoutMainAction(!slideoutMainAction)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show Secondary Action Button"
                  labelPlacement="top"
                  checked={slideoutSecondaryAction}
                  onChange={() => setSlideoutSecondaryAction(!slideoutSecondaryAction)}
                />
              </li>
              <li>
                <SwitchComponent
                  label="Show optional node"
                  labelPlacement="top"
                  checked={slideoutOptionalNode}
                  onChange={() => setSlideoutOptionalNode(!slideoutOptionalNode)}
                />
              </li>
            </ul>
          </div>
          <ButtonMain onClick={() => setOpenSlideout(true)} label="Open slideout" />
          {openSlideout &&
            <Slideout
              title={slideoutTitle || 'Placeholder Title'}
              content={
                <>
                  <TextField />
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquet eget sit amet tellus cras adipiscing. Lacus luctus accumsan tortor posuere ac ut consequat. Amet tellus cras adipiscing enim eu turpis. Aliquet nibh praesent tristique magna. Convallis convallis tellus id interdum velit laoreet id. At tempor commodo ullamcorper a lacus vestibulum. Quam vulputate dignissim suspendisse in est ante. Pellentesque habitant morbi tristique senectus et netus et malesuada. Imperdiet nulla malesuada pellentesque elit eget gravida cum sociis natoque. In nisl nisi scelerisque eu ultrices vitae auctor. Ornare aenean euismod elementum nisi quis eleifend quam. Nunc faucibus a pellentesque sit amet porttitor eget dolor morbi. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique. Quis ipsum suspendisse ultrices gravida dictum fusce ut. Risus commodo viverra maecenas accumsan lacus vel. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam. Convallis aenean et tortor at risus. Magna sit amet purus gravida quis. Morbi leo urna molestie at elementum eu facilisis sed. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras.
                    Bibendum arcu vitae elementum curabitur vitae nunc sed. Pharetra et ultrices neque ornare aenean euismod elementum nisi quis. Nunc eget lorem dolor sed viverra ipsum nunc aliquet. Tellus molestie nunc non blandit massa enim. Diam volutpat commodo sed egestas egestas. Mauris sit amet massa vitae tortor condimentum lacinia. Sem fringilla ut morbi tincidunt augue. Mi quis hendrerit dolor magna. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Scelerisque felis imperdiet proin fermentum leo vel orci porta. Morbi tristique senectus et netus et malesuada fames ac turpis. Et leo duis ut diam quam nulla porttitor massa. Eget dolor morbi non arcu. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Ac feugiat sed lectus vestibulum mattis ullamcorper velit. Vitae proin sagittis nisl rhoncus.
                    Amet aliquam id diam maecenas ultricies mi eget. Amet volutpat consequat mauris nunc congue nisi vitae suscipit. Penatibus et magnis dis parturient montes. Dignissim suspendisse in est ante in nibh mauris. Mauris rhoncus aenean vel elit. Tempus quam pellentesque nec nam aliquam sem et. Vestibulum mattis ullamcorper velit sed ullamcorper morbi. Sit amet volutpat consequat mauris nunc. Nibh sit amet commodo nulla facilisi nullam vehicula ipsum. Sed viverra ipsum nunc aliquet bibendum enim facilisis. Tempus imperdiet nulla malesuada pellentesque elit eget. Arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Pretium fusce id velit ut tortor pretium.
                    Malesuada proin libero nunc consequat interdum. Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida. Massa id neque aliquam vestibulum. Mi tempus imperdiet nulla malesuada pellentesque elit eget. Pellentesque id nibh tortor id aliquet lectus proin nibh. Magnis dis parturient montes nascetur ridiculus mus. Velit laoreet id donec ultrices tincidunt arcu. Auctor eu augue ut lectus arcu. Lacus suspendisse faucibus interdum posuere lorem ipsum. Morbi tristique senectus et netus et malesuada fames ac turpis. Leo integer malesuada nunc vel. Id volutpat lacus laoreet non. Tincidunt dui ut ornare lectus sit amet est. Ultricies mi eget mauris pharetra et ultrices neque ornare aenean. Mi eget mauris pharetra et ultrices neque ornare aenean euismod. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Velit egestas dui id ornare. Enim praesent elementum facilisis leo vel fringilla.
                  </p>
                </>
              }
              footer={slideoutFooter}
              showCancel={slideoutCancel}
              cancelProps={{
                size: 'small',
              }}
              onClose={setOpenSlideout}
              mainActionButton={slideoutMainAction && <ButtonMain size="small" label="Main content" />}
              secondaryActionButton={slideoutSecondaryAction && <ButtonMain size="small" label="Secondary content" />}
              optionalNode={slideoutOptionalNode && <SwitchComponent label="Optional Node label" />}
            />
          }
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
