import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import * as Sentry from '@sentry/react';
import Alert from './alerts-and-prompts/Alert';
import Chip from './buttons-checkboxes-chips/Chip';
import ListWidget from './charts/ListWidget';
import NumberWidget from './charts/NumberWidget';
import StackedBarChartWidget from './charts/StackedBarChartWidget';
import VerticalBarChartWidget from './charts/VerticalBarChartWidget';
import TimelineWidget from './charts/TimelineWidget';
import TagList from './menus-lists-dialogs/TagList';
import TextField from './inputs/TextField';
import ListSort from './inputs/ListSort';
import TextArea from './inputs/TextArea';
import DatePicker from './inputs/DatePicker';
import LanguagePickerSelect from './inputs/LanguagePickerSelect';
import Time from './inputs/Time';
import { ToggleButton, ToggleButtonGroup } from './inputs/ToggleButtonGroup';
import Select from './inputs/Select';
import SwitchComponent from './inputs/SwitchComponent';
import ButtonMain from './buttons-checkboxes-chips/ButtonMain';
import Checkbox from './buttons-checkboxes-chips/Checkbox';
import Slideout from './slideout/Slideout';
import Reorder from '../layout/Reorder';
import AddIcon from '../../icons/settings.svg';
import CalendarIcon from '../../icons/calendar_month.svg';
import ListIcon from '../../icons/list.svg';
import FigmaColorLogo from '../../icons/figma_color.svg';
import ArticleCard from '../search/SearchResultsCards/ArticleCard';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import Loader from '../cds/loading/Loader';
import ParsedText from '../ParsedText';
import ClusterCard from '../search/SearchResultsCards/ClusterCard';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import { FlashMessageSetterContext } from '../FlashMessage';
import {
  getQueryStringValue,
  pushQueryStringValue,
  deleteQueryStringValue,
} from '../../urlHelpers';
import styles from './sandbox.module.css';

const SandboxComponent = ({ admin }) => {
  const isAdmin = admin?.is_admin;
  if (!isAdmin) {
    return null;
  }

  let category = null;
  category = getQueryStringValue('category');
  const [selectedCategory, setSelectedTab] = React.useState(category);

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

  const [articleCardShared, setArticleCardShared] = React.useState(false);
  const [articleCardVariant, setArticleCardVariant] = React.useState('fact-check');
  const [articleCardLink, setArticleCardLink] = React.useState(Boolean(true));
  const [articleCardTags, setArticleCardTags] = React.useState(Boolean(true));
  const [articleCardPublished, setArticleCardPublished] = React.useState(true);

  const [listItemShared, setListItemShared] = React.useState(Boolean(false));
  const [listItemMediaPreview, setListItemMediaPreview] = React.useState(Boolean(true));
  const [listItemRequests, setListItemRequests] = React.useState(Boolean(true));
  const [listItemArticles, setListItemArticles] = React.useState(Boolean(true));
  const [listItemFactCheck, setListItemFactCheck] = React.useState(Boolean(true));
  const [listItemFactCheckLink, setListItemFactCheckLink] = React.useState(Boolean(true));
  const [listItemDescription, setListItemDescription] = React.useState(Boolean(true));
  const [listItemSuggestions, setListItemSuggestions] = React.useState(Boolean(true));
  const [listItemUnread, setListItemUnread] = React.useState(Boolean(true));
  const [listItemPublished, setListItemPublished] = React.useState(Boolean(true));
  const [listItemDataPointsFactCheck, setListItemDataPointsFactCheck] = React.useState(Boolean(false));
  const [listItemDataPoints, setListItemDataPoints] = React.useState([]);
  const [listItemFactCheckCount, setListItemFactCheckCount] = React.useState(1);

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  // This triggers when the list item data points are changed
  React.useEffect(() => {
    if (listItemDataPointsFactCheck) {
      setListItemDataPoints([CheckFeedDataPoints.PUBLISHED_FACT_CHECKS, CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS]);
    } else if (!listItemDataPointsFactCheck) {
      setListItemDataPoints([]);
    }
  }, [listItemDataPointsFactCheck]);

  const onSetListItemShared = (shared) => {
    setListItemDataPointsFactCheck(shared);
    setListItemSuggestions(false);
    setListItemUnread(false);
    setListItemArticles(true);
    setListItemFactCheck(true);
    setListItemPublished(true);
    setListItemRequests(true);
    setListItemShared(shared);
  };

  const onSetListItemRequests = (requests) => {
    setListItemRequests(requests);
  };

  const onSetListItemArticles = (articles) => {
    setListItemArticles(articles);
    setListItemFactCheck(false);
    setListItemFactCheckLink(false);
  };

  const onSetListItemFactCheck = (factcheck) => {
    if (!factcheck && listItemShared) {
      setListItemFactCheckLink(false);
      setListItemPublished(false);
    } else if (factcheck && listItemShared) {
      setListItemPublished(true);
    } else if (!factcheck) {
      setListItemFactCheckLink(false);
      setListItemPublished(false);
    }
    setListItemFactCheck(factcheck);
  };

  const [alertIcon, setAlertIcon] = React.useState(Boolean(true));
  const [alertButton, setAlertButton] = React.useState(Boolean(true));
  const [alertTitle, setAlertTitle] = React.useState(Boolean(true));
  const [alertContent, setAlertContent] = React.useState(Boolean(true));
  const [alertClosable, setAlertClosable] = React.useState(Boolean(true));
  const [toastLink, setToastLink] = React.useState(Boolean(false));
  const [toastBreaks, setToastBreaks] = React.useState(Boolean(false));

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
  const [slideoutScrollable, setSlideoutScrollable] = React.useState(Boolean(true));
  const [slideoutCancel, setSlideoutCancel] = React.useState(Boolean(true));
  const [slideoutMainAction, setSlideoutMainAction] = React.useState(Boolean(true));
  const [slideoutSecondaryAction, setSlideoutSecondaryAction] = React.useState(Boolean(false));
  const [slideoutOptionalNode, setSlideoutOptionalNode] = React.useState(Boolean(false));

  const [loadingText, setLoadingText] = React.useState(Boolean(false));
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

  const [buttonTheme, setButtonTheme] = React.useState('info');
  const onChangeButtonTheme = (event) => {
    setButtonTheme(event.target.value);
  };

  const [reorderTheme, setReorderTheme] = React.useState('gray');
  const onChangeReorderTheme = (event) => {
    setReorderTheme(event.target.value);
  };

  const [sampleDataSet, setSampleDataSet] = React.useState('design');
  const [stackedBarChartEmptySection, setStackedBarChartEmptySection] = React.useState(true);

  const verticalBarChartData = {
    design: [
      { name: 'Text', value: 6000 },
      { name: 'Video', value: 5000 },
      { name: 'Image', value: 4000 },
      { name: 'Link', value: 3000 },
      { name: 'Audio', value: 2000 },
      { name: 'Social Media', value: 1000 },
    ],
    statuses: [
      { name: 'Unstarted', value: 2999, color: '#518FFF' },
      { name: 'Inconclusive', value: 4987, color: '#9e9e9e' },
      { name: 'In Progress', value: 1890, color: '#efac51' },
      { name: 'False', value: 6005, color: '#f04747' },
      { name: 'Verified', value: 3021, color: '#5cae73' },
    ],
  };

  const stackedBarChartData = stackedBarChartEmptySection ? [
    { name: 'Audio', value: 5000 },
    { name: 'Video', value: 4000 },
    { name: 'Text', value: 3000 },
    { name: 'Image', value: 2000 },
    { name: 'empty', value: 6000 },
  ] : [
    { name: 'Audio', value: 5000 },
    { name: 'Video', value: 4000 },
    { name: 'Text', value: 3000 },
    { name: 'Image', value: 2000 },
  ];

  const [listWidgetBackgroundColor, setListWidgetBackgroundColor] = React.useState('var(--color-pink-93)');

  const [numberWidgetBackgroundColor, setNumberWidgetBackgroundColor] = React.useState('var(--color-pink-93)');
  const [numberWidgetItemCount, setNumberWidgetItemCount] = React.useState('2024');
  const [numberWidgetUnit, setNumberWidgetUnit] = React.useState(Boolean(true));
  const [numberWidgetContextText, setNumberWidgetContextText] = React.useState(Boolean(true));

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

  const flashMessage = (variant, link) => (
    <>This is a test, this is only a test, of variant: <strong>{variant}</strong>{ link && <> and a link to: <a href="https://www.meedan.com">meedan.com</a></> }</>
  );

  const onFlash = (variant) => {
    if (variant === 'object') {
      setFlashMessage([{ code: '5000', message: 'Creating an error' }], 'error');
    } else if (toastBreaks) {
      setFlashMessage('I am a string<br />with multiple messages one long<br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque et ornare nunc. Curabitur quis tempus nulla. Donec molestie leo magna, eget rhoncus diam porta at. Curabitur vel accumsan nisl, sit amet posuere augue. Curabitur quis tristique nulla. In hac habitasse platea dictumst. Vivamus ultrices dignissim eros nec malesuada. Integer lorem ipsum, pharetra quis leo eu, lobortis eleifend nisl. Ut rutrum, lectus nec mattis finibus, dolor ante elementum ligula, sit amet dignissim libero diam viverra justo. Nunc vitae nisi ac purus feugiat congue id non lacus. Aliquam eleifend, felis at tincidunt commodo, erat sapien consequat ligula, faucibus condimentum ligula massa vitae nisi.', variant);
    } else {
      setFlashMessage(flashMessage(variant, toastLink), variant);
    }
  };

  const handleClick = (newCategory) => {
    if (category !== newCategory) {
      if (newCategory === 'all') {
        setSelectedTab(null);
        deleteQueryStringValue('category');
      } else {
        setSelectedTab(newCategory);
        pushQueryStringValue('category', newCategory);
      }
    }
  };

  return (
    <div className={styles.sandbox}>
      <h5>
        UI Sandbox&nbsp;<span aria-label="Beach" role="img">🏖️</span>
      </h5>
      <ul className={styles.sandboxNav}>
        <li>
          <ButtonMain label="All" size="small" theme={!selectedCategory ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('all')} />
        </li>
        <li>
          <ButtonMain label="Cards" size="small" theme={selectedCategory === 'cards' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('cards')} />
        </li>
        <li>
          <ButtonMain label="Buttons" size="small" theme={selectedCategory === 'buttons' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('buttons')} />
        </li>
        <li>
          <ButtonMain label="Inputs" size="small" theme={selectedCategory === 'inputs' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('inputs')} />
        </li>
        <li>
          <ButtonMain label="Chips" size="small" theme={selectedCategory === 'chips' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('chips')} />
        </li>
        <li>
          <ButtonMain label="Tags" size="small" theme={selectedCategory === 'tags' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('tags')} />
        </li>
        <li>
          <ButtonMain label="Alerts &amp; Prompts" size="small" theme={selectedCategory === 'alerts' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('alerts')} />
        </li>
        <li>
          <ButtonMain label="Text Display" size="small" theme={selectedCategory === 'text' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('text')} />
        </li>
        <li>
          <ButtonMain label="Loading Animations" size="small" theme={selectedCategory === 'loaders' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('loaders')} />
        </li>
        <li>
          <ButtonMain label="Slideout" size="small" theme={selectedCategory === 'slideout' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('slideout')} />
        </li>
        <li>
          <ButtonMain label="Errors" size="small" theme={selectedCategory === 'errors' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('errors')} />
        </li>
        <li>
          <ButtonMain label="Charts" size="small" theme={selectedCategory === 'charts' ? 'info' : 'lightText'} variant="contained" onClick={() => handleClick('charts')} />
        </li>
      </ul>
      { (!selectedCategory || selectedCategory === 'cards') &&
        <section>
          <h6>Item Cards</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                ArticleCard
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/design/i1LSbpQXKyA7dLc8AkgtKA/Articles?node-id=61-40003&t=nQx8FOqn9bhFtiZZ-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={articleCardShared}
                    label="Shared Feed"
                    labelPlacement="top"
                    onChange={() => setArticleCardShared(!articleCardShared)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={articleCardPublished}
                    disabled={articleCardShared}
                    label="Published"
                    labelPlacement="top"
                    onChange={() => setArticleCardPublished(!articleCardPublished)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={articleCardLink}
                    label="Link"
                    labelPlacement="top"
                    onChange={() => setArticleCardLink(!articleCardLink)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={articleCardTags}
                    label="Tags"
                    labelPlacement="top"
                    onChange={() => setArticleCardTags(!articleCardTags)}
                  />
                </li>
                <li>
                  <Select
                    label="Variant"
                    value={articleCardVariant}
                    onChange={e => setArticleCardVariant(e.target.value)}
                  >
                    <option value="explainer">explainer (default)</option>
                    <option value="fact-check">fact-check</option>
                  </Select>
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <ArticleCard
                date={1702677106.846}
                isPublished={articleCardPublished}
                languageCode={articleCardShared ? null : 'en'}
                publishedAt={1702677106.846}
                statusColor={articleCardVariant === 'fact-check' ? '#ff0000' : null}
                statusLabel={articleCardVariant === 'fact-check' ? 'The Status is very very long' : null}
                summary="Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can."
                tags={articleCardTags ? ['Novel', 'Moby Dick', '19th Century'] : null}
                teamAvatar={articleCardShared ? 'https://placekitten.com/300/300' : null}
                teamName={articleCardShared ? 'Kitty Team' : null}
                title="Moby-Dick; or, The Whale."
                url={articleCardLink && 'https://example.com/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it'}
                variant={articleCardVariant}
                onChangeTags={() => {}}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                ClusterCard
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/N1W1p7anE8xxekD7EyepVE/Shared-Feeds?type=design&node-id=2411-37415&mode=design"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={listItemShared}
                    label="Shared Feed"
                    labelPlacement="top"
                    onChange={() => onSetListItemShared(!listItemShared)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemMediaPreview}
                    label="Media Preview"
                    labelPlacement="top"
                    onChange={() => setListItemMediaPreview(!listItemMediaPreview)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemRequests}
                    disabled={listItemShared}
                    label="Requests"
                    labelPlacement="top"
                    onChange={() => onSetListItemRequests(!listItemRequests)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemDescription}
                    label="Description"
                    labelPlacement="top"
                    onChange={() => setListItemDescription(!listItemDescription)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemArticles}
                    disabled={listItemShared}
                    label="Articles"
                    labelPlacement="top"
                    onChange={() => onSetListItemArticles(!listItemArticles)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemFactCheck}
                    disabled={!listItemArticles}
                    label="Fact-Check"
                    labelPlacement="top"
                    onChange={() => onSetListItemFactCheck(!listItemFactCheck)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemFactCheckLink}
                    disabled={!listItemFactCheck}
                    label="Fact-Check Link"
                    labelPlacement="top"
                    onChange={() => setListItemFactCheckLink(!listItemFactCheckLink)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemFactCheckCount > 1 && listItemFactCheck}
                    disabled={!listItemShared || !listItemFactCheck}
                    label="Fact Checks > 1"
                    labelPlacement="top"
                    onChange={() => {
                      if (listItemFactCheckCount === 1) {
                        setListItemFactCheckCount(12345);
                      } else {
                        setListItemFactCheckCount(1);
                      }
                    }}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemSuggestions}
                    disabled={listItemShared}
                    label="Suggestions"
                    labelPlacement="top"
                    onChange={() => setListItemSuggestions(!listItemSuggestions)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemUnread}
                    disabled={listItemShared}
                    label="Unread"
                    labelPlacement="top"
                    onChange={() => setListItemUnread(!listItemUnread)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={listItemPublished}
                    disabled={listItemShared || !listItemFactCheck}
                    label="Published"
                    labelPlacement="top"
                    onChange={() => setListItemPublished(!listItemPublished)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <ClusterCard
                articlesCount={listItemArticles ? 1234 : null}
                channels={(listItemRequests || listItemShared) && { main: 8, others: [5, 8, 7, 6, 9, 10, 13] }}
                dataPoints={listItemDataPoints}
                date={new Date('2023-12-15T17:19:40Z')}
                description={listItemDescription && 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.'}
                factCheckCount={listItemFactCheck && listItemFactCheckCount}
                factCheckUrl={listItemFactCheckLink && 'https://example.com/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it/this-is-a/very-long-url/that-could-break-some-layout/if-we-let-it'}
                isPublished={listItemPublished}
                isUnread={listItemUnread}
                lastRequestDate={new Date('2024-01-15T12:00:22Z')}
                mediaCount={12345}
                mediaThumbnail={listItemMediaPreview ? mediaThumbnail : null}
                mediaType="UploadedImage"
                publishedAt={1702677106846}
                rating={listItemFactCheck ? 'False' : null}
                ratingColor={listItemFactCheck ? '#f00' : null}
                requestsCount={listItemRequests || listItemShared ? 7890 : 0}
                suggestionsCount={listItemSuggestions ? 567890 : null}
                title={listItemShared ? 'Card in Shared Feed' : 'Card in Tipline Workspace'}
                workspaces={listItemShared && workspaces}
                onCheckboxChange={!listItemShared ? () => {} : null}
              />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'buttons') &&
        <section>
          <h6>Buttons</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                ButtonMain
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=139-6525&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Variant"
                    value={buttonVariant}
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
                    value={buttonSize}
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
                    value={buttonTheme}
                    onChange={onChangeButtonTheme}
                  >
                    <optgroup label="info">
                      <option value="info">info (default)</option>
                      <option value="lightInfo">lightInfo</option>
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
                    <optgroup label="beige">
                      <option value="beige">beige</option>
                      <option value="lightBeige">lightBeige</option>
                    </optgroup>
                  </Select>
                </li>
                <li>
                  <SwitchComponent
                    checked={buttonDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setMainButtonDisabled(!buttonDisabled)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants} style={{ backgroundColor: buttonTheme === 'white' ? 'var(--color-gray-15)' : null }}>
              <ButtonMain disabled={buttonDisabled} label="Default" size={buttonSize} theme={buttonTheme} variant={buttonVariant} />
              <ButtonMain disabled={buttonDisabled} iconLeft={<AddIcon />} label="Left" size={buttonSize} theme={buttonTheme} variant={buttonVariant} />
              <ButtonMain disabled={buttonDisabled} iconRight={<AddIcon />} label="Right" size={buttonSize} theme={buttonTheme} variant={buttonVariant} />
              <ButtonMain disabled={buttonDisabled} iconCenter={<AddIcon />} label="Center" size={buttonSize} theme={buttonTheme} variant={buttonVariant} />
              <ButtonMain
                buttonProps={{
                  type: 'submit',
                }}
                disabled={buttonDisabled}
                label="Submit Button"
                size={buttonSize}
                theme={buttonTheme}
                variant={buttonVariant}
              />
              <ButtonMain
                buttonProps={{
                  type: null,
                }}
                disabled
                label="Disabled Type Null Button"
                size={buttonSize}
                theme={buttonTheme}
                variant={buttonVariant}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Reorder
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=2142-47843&mode=design&t=Xk5LFyi7pmsXEX1T-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Variant"
                    value={reorderVariant}
                    onChange={onChangeReorderVariant}
                  >
                    <option value="vertical">vertical (default)</option>
                    <option value="horizontal">horizontal</option>
                  </Select>
                </li>
                <li>
                  <Select
                    label="Theme"
                    value={reorderTheme}
                    onChange={onChangeReorderTheme}
                  >
                    <option value="gray">gray (default)</option>
                    <option value="white">white</option>
                  </Select>
                </li>
                <li>
                  <SwitchComponent
                    checked={reorderFirst}
                    label="First"
                    labelPlacement="top"
                    onChange={() => setReorderFirst(!reorderFirst)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={reorderLast}
                    label="Last"
                    labelPlacement="top"
                    onChange={() => setReorderLast(!reorderLast)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants} style={{ backgroundColor: reorderTheme === 'white' ? 'var(--color-gray-96)' : 'var(--color-white-100' }}>
              <Reorder
                disableDown={reorderLast}
                disableUp={reorderFirst}
                theme={reorderTheme}
                variant={reorderVariant}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                ToggleButtonGroup
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3703-28265&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Size"
                    value={toggleButtonGroupSize}
                    onChange={onChangeToggleButtonGroupSize}
                  >
                    <option value="default">default</option>
                    <option value="small">small</option>
                    <option value="large">large</option>
                  </Select>
                </li>
                <li>
                  <Select
                    label="Variant"
                    value={toggleButtonGroupVariant}
                    onChange={onChangeToggleButtonGroupVariant}
                  >
                    <option value="contained">contained</option>
                    <option value="outlined">outlined</option>
                  </Select>
                </li>
                <li>
                  <SwitchComponent
                    checked={toggleButtonGroupLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setToggleButtonGroupLabel(!toggleButtonGroupLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={toggleButtonGroupHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setToggleButtonGroupHelp(!toggleButtonGroupHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={toggleButtonGroupDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setToggleButtonGroupDisabled(!toggleButtonGroupDisabled)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants} style={{ backgroundColor: 'var(--color-beige-93' }}>
              <ToggleButtonGroup
                exclusive
                helpContent={toggleButtonGroupHelp ? 'I can be of help to ToggleButtonGroup' : null}
                label={toggleButtonGroupLabel ? 'I am a toggleButtonGroup label' : null}
                size={toggleButtonGroupSize}
                value={toggleButtonGroupValue}
                variant={toggleButtonGroupVariant}
                onChange={(e, newValue) => changeToggleButtonGroupExample(newValue)}
              >
                <ToggleButton disabled={toggleButtonGroupDisabled} key="1" value="1">
                  One
                </ToggleButton>
                <ToggleButton disabled={toggleButtonGroupDisabled} key="2" value="2">
                  Two
                </ToggleButton>
                <ToggleButton disabled={toggleButtonGroupDisabled} key="3" value="3">
                  Three
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'inputs') &&
        <section>
          <h6>Inputs</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Switch
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=194-3449&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={switchesDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setSwitchesDisabled(!switchesDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={switchesHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setSwitchesHelp(!switchesHelp)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants}>
              <SwitchComponent
                checked={switched}
                disabled={switchesDisabled}
                helperContent={switchesHelp ? 'I can help switches' : null}
                label="I am a switch label on top"
                labelPlacement="top"
                onChange={() => setSwitchExample(!switched)}
              />
              <SwitchComponent
                checked={switched}
                disabled={switchesDisabled}
                helperContent={switchesHelp ? 'I can help switches' : null}
                label="I am a switch label on the bottom"
                labelPlacement="bottom"
                onChange={() => setSwitchExample(!switched)}
              />
              <SwitchComponent
                checked={switched}
                disabled={switchesDisabled}
                helperContent={switchesHelp ? 'I can help switches' : null}
                label="I am a switch label at the start"
                labelPlacement="start"
                onChange={() => setSwitchExample(!switched)}
              />
              <SwitchComponent
                checked={switched}
                disabled={switchesDisabled}
                helperContent={switchesHelp ? 'I can help switches' : null}
                label="I am a switch label at the end"
                labelPlacement="end"
                onChange={() => setSwitchExample(!switched)}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                TextField
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=623-12029&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={textfieldLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setTextfieldLabel(!textfieldLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldIconLeft}
                    label="Icon Left"
                    labelPlacement="top"
                    onChange={() => setTextfieldIconLeft(!textfieldIconLeft)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldIconRight}
                    label="Icon Right"
                    labelPlacement="top"
                    onChange={() => setTextfieldIconRight(!textfieldIconRight)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setTextfieldHelp(!textfieldHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setTextfieldDisabled(!textfieldDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldRequired}
                    label="Required"
                    labelPlacement="top"
                    onChange={() => setTextfieldRequired(!textfieldRequired)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldError}
                    label="Error"
                    labelPlacement="top"
                    onChange={() => setTextfieldError(!textfieldError)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textfieldRemovable}
                    label="Removable"
                    labelPlacement="top"
                    onChange={() => setTextfieldRemovable(!textfieldRemovable)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <TextField
                disabled={textfieldDisabled}
                error={textfieldError}
                helpContent={textfieldHelp ? 'I can be of help to textfield' : null}
                iconLeft={textfieldIconLeft ? <ListIcon /> : null}
                iconRight={textfieldIconRight ? <CalendarIcon /> : null}
                label={textfieldLabel ? 'I am a textfield title' : null}
                placeholder="I am a placeholder for textfield"
                required={textfieldRequired}
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
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=34-5720&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={selectLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setSelectLabel(!selectLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectIconLeft}
                    label="Icon Left"
                    labelPlacement="top"
                    onChange={() => setSelectIconLeft(!selectIconLeft)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setSelectHelp(!selectHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setSelectDisabled(!selectDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectRequired}
                    label="Required"
                    labelPlacement="top"
                    onChange={() => setSelectRequired(!selectRequired)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectError}
                    label="Error"
                    labelPlacement="top"
                    onChange={() => setSelectError(!selectError)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={selectRemovable}
                    label="Removable"
                    labelPlacement="top"
                    onChange={() => setSelectRemovable(!selectRemovable)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <Select
                disabled={selectDisabled}
                error={selectError}
                helpContent={selectHelp ? 'I can be of help to select' : null}
                iconLeft={selectIconLeft ? <ListIcon /> : null}
                label={selectLabel ? 'I am a select title' : null}
                required={selectRequired}
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
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=3606-26274&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Row Count"
                    value={textareaRows}
                    onChange={onChangeTextareaRows}
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
                    value={textareaMaxHeight}
                    onChange={onChangeTextareaMaxHeight}
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
                    checked={textareaLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setTextareaLabel(!textareaLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaAutogrow}
                    label="AutoGrow"
                    labelPlacement="top"
                    onChange={() => setTextareaAutogrow(!textareaAutogrow)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaLimited}
                    label="Limit Character Count"
                    labelPlacement="top"
                    onChange={() => setTextareaLimited(!textareaLimited)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setTextareaHelp(!textareaHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setTextareaDisabled(!textareaDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaRequired}
                    label="Required"
                    labelPlacement="top"
                    onChange={() => setTextareaRequired(!textareaRequired)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={textareaError}
                    label="Error"
                    labelPlacement="top"
                    onChange={() => setTextareaError(!textareaError)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              { textareaLimited ?
                <LimitedTextArea
                  autoGrow={textareaAutogrow}
                  disabled={textareaDisabled}
                  helpContent={textareaHelp ? 'I can be of help to limited textarea' : null}
                  label={textareaLabel ? 'I am a limited textarea title' : null}
                  maxChars={500}
                  maxHeight={textareaMaxHeight === 'none' ? undefined : textareaMaxHeight}
                  placeholder="I am a placeholder for limited textarea"
                  required={textareaRequired}
                  rows={textareaRows === 'none' ? undefined : textareaRows}
                  setValue={setLimitedText}
                  value={limitedText}
                />
                :
                <TextArea
                  autoGrow={textareaAutogrow}
                  disabled={textareaDisabled}
                  error={textareaError}
                  helpContent={textareaHelp ? 'I can be of help to textarea' : null}
                  label={textareaLabel ? 'I am a textarea title' : null}
                  maxHeight={textareaMaxHeight === 'none' ? undefined : textareaMaxHeight}
                  placeholder="I am a placeholder for textarea"
                  required={textareaRequired}
                  rows={textareaRows === 'none' ? undefined : textareaRows}
                />
              }
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                List Sort
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=1475-46077&mode=design&t=GXBsN674hkLPLGfM-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
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
                    checked={timeLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setTimeLabel(!timeLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={timeHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setTimeHelp(!timeHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={timeDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setTimeDisabled(!timeDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={timeError}
                    label="Error"
                    labelPlacement="top"
                    onChange={() => setTimeError(!timeError)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <Time
                disabled={timeDisabled}
                error={timeError}
                helpContent={timeHelp ? 'I can be of help to time' : null}
                label={timeLabel ? 'I am a time label' : null}
                required
                value="09:00"
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
                    checked={datepickerLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setDatepickerLabel(!datepickerLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={datepickerHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setDatepickerHelp(!datepickerHelp)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={datepickerDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setDatepickerDisabled(!datepickerDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={datepickerError}
                    label="Error"
                    labelPlacement="top"
                    onChange={() => setDatepickerError(!datepickerError)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <DatePicker
                disabled={datepickerDisabled}
                error={datepickerError}
                helpContent={datepickerHelp ? 'I can be of help to datepicker' : null}
                label={datepickerLabel ? 'I am a datepicker label' : null}
                required
                value="2023-12-17"
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
                    checked={languagePickerSelectLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setLanguagePickerSelectLabel(!languagePickerSelectLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={languagePickerSelectDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setLanguagePickerSelectDisabled(!languagePickerSelectDisabled)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={languagePickerSelectHelp}
                    label="Show Help"
                    labelPlacement="top"
                    onChange={() => setLanguagePickerSelectHelp(!languagePickerSelectHelp)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <LanguagePickerSelect
                helpContent={languagePickerSelectHelp ? 'I can be of help to LanguagePickerSelect' : null}
                isDisabled={languagePickerSelectDisabled}
                label={languagePickerSelectLabel ? 'I am a LanguagePickerSelect label' : null}
                languages={JSON.parse('["en", "af", "zn"]')}
                selectedLanguage="en"
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
                    checked={checkboxLabel}
                    label="Label"
                    labelPlacement="top"
                    onChange={() => setCheckboxLabel(!checkboxLabel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={checkboxDisabled}
                    label="Disabled"
                    labelPlacement="top"
                    onChange={() => setCheckboxDisabled(!checkboxDisabled)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <Checkbox
                checked={checkboxChecked}
                disabled={checkboxDisabled}
                label={checkboxLabel ? 'I am a Checkbox label' : null}
                onChange={() => setCheckboxChecked(!checkboxChecked)}
              />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'chips') &&
        <section>
          <h6>Chips</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Chip
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=157-5443&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={chipRemovable}
                    label="Removable"
                    labelPlacement="top"
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
      }
      { (!selectedCategory || selectedCategory === 'tags') &&
        <section>
          <h6>Tags</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                TagList
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={tagsReadOnly}
                    label="Read Only"
                    labelPlacement="top"
                    onChange={() => setTagsReadOnly(!tagsReadOnly)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={maxTags}
                    label="Max 5 Tags"
                    labelPlacement="top"
                    onChange={() => setMaxTags(!maxTags)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={tagsFixedWidth}
                    label="Fixed Width (300px)"
                    labelPlacement="top"
                    onChange={() => setTagsFixedWidth(!tagsFixedWidth)}
                  />
                </li>
              </ul>
            </div>
            <div className={cx(
              styles.componentInlineVariants,
              {
                [styles['fixed-width-tags']]: tagsFixedWidth,
              })
            }
            >
              <TagList
                maxTags={maxTags ? 5 : undefined}
                readOnly={tagsReadOnly}
                setTags={setTags}
                tags={tags}
              />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'alerts') &&
        <section>
          <h6>Alerts &amp; Prompts</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Alert
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=4-45716&mode=design&t=G3fBIdgR6AWtOlNu-4"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Variant"
                    value={alertVariant}
                    onChange={onChangeAlertVariant}
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
                    value={alertPlacement}
                    onChange={onChangeAlertPlacement}
                  >
                    <option value="default">default</option>
                    <option value="floating">floating</option>
                    <option value="banner">banner</option>
                    <option value="contained">contained</option>
                  </Select>
                </li>
                <li>
                  <SwitchComponent
                    checked={alertTitle}
                    label="Title"
                    labelPlacement="top"
                    onChange={() => setAlertTitle(!alertTitle)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={alertContent}
                    label="Content"
                    labelPlacement="top"
                    onChange={() => setAlertContent(!alertContent)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={alertIcon}
                    label="Icon"
                    labelPlacement="top"
                    onChange={() => setAlertIcon(!alertIcon)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={alertButton}
                    label="Button"
                    labelPlacement="top"
                    onChange={() => setAlertButton(!alertButton)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={alertClosable}
                    label="Closable"
                    labelPlacement="top"
                    onChange={() => setAlertClosable(!alertClosable)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants}>
              <Alert
                banner={alertPlacement === 'banner'}
                buttonLabel={alertButton && <span>alert action</span>}
                contained={alertPlacement === 'contained'}
                content={alertContent && <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</span>}
                floating={alertPlacement === 'floating'}
                icon={alertIcon}
                title={alertTitle && <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>}
                variant={alertVariant}
                onClose={alertClosable ? () => {} : null}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Toasts
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={toastLink}
                    label="Link"
                    labelPlacement="top"
                    onChange={() => setToastLink(!toastLink)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={toastBreaks}
                    label="Line Breaks"
                    labelPlacement="top"
                    onChange={() => setToastBreaks(!toastBreaks)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants}>
              <ButtonMain disabled={toastBreaks} label="Info" size="default" theme="info" variant="contained" onClick={() => onFlash('info')} />
              <ButtonMain disabled={toastBreaks} label="Success" size="default" theme="validation" variant="contained" onClick={() => onFlash('success')} />
              <ButtonMain disabled={toastBreaks} label="Warning" size="default" theme="alert" variant="contained" onClick={() => onFlash('warning')} />
              <ButtonMain label="Error" size="default" theme="error" variant="contained" onClick={() => onFlash('error')} />
              <ButtonMain disabled={toastBreaks || toastLink} label="Object Error" size="default" theme="error" variant="contained" onClick={() => onFlash('object')} />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'text') &&
        <section>
          <h6>Parsed Text</h6>
          <div className={styles.componentWrapper}>
            <ParsedText
              fileUrlName=""
              mediaChips
              text="Call me Ishmael. This is my Youtube video: https://www.youtube.com/watch?v=zg84olIrn-k Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. This is an image of the cover of this book: https://upload.wikimedia.org/wikipedia/commons/3/36/Moby-Dick_FE_title_page.jpg Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can."
            />
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'loaders') &&
        <section>
          <h6>Loading Animations</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Loader
              </div>
              <ul>
                <li>
                  <Select
                    label="Size"
                    value={loadingSize}
                    onChange={onChangeLoadingSize}
                  >
                    <option value="icon">icon</option>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option selected value="large">large</option>
                  </Select>
                </li>
                <li>
                  <Select
                    label="Theme"
                    value={loadingTheme}
                    onChange={onChangeLoadingTheme}
                  >
                    <option selected value="grey">grey</option>
                    <option value="white">white</option>=
                  </Select>
                </li>
                <li>
                  <Select
                    label="Variant"
                    onChange={onChangeLoadingVariant}
                  >
                    <option selected value="inline">inline</option>
                    <option value="page">page</option>=
                  </Select>
                </li>
                <li>
                  <SwitchComponent
                    checked={loadingText}
                    label="Text"
                    labelPlacement="top"
                    onChange={() => setLoadingText(!loadingText)}
                  />
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
              style={{ pointerEvents: loadingVariant === 'page' ? 'none' : null }}
            >
              <Loader size={loadingSize} text={loadingText && 'Fetching latest data, please wait…'} theme={loadingTheme} variant={loadingVariant} />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'slideout') &&
        <section id="sandbox-slideout">
          <h6>Slideout</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                Slideout
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/i1LSbpQXKyA7dLc8AkgtKA/Articles?type=design&node-id=106-63346&mode=design&t=1tA1BlK81Dh6DPCk-0"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <TextField
                    label="Slideout Title"
                    labelPlacement="top"
                    value={slideoutTitle}
                    onChange={e => setSlideoutTitle(e.target.value)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutFooter}
                    label="Show Footer"
                    labelPlacement="top"
                    onChange={() => setSlideoutFooter(!slideoutFooter)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutScrollable}
                    label="Content Scrollable"
                    labelPlacement="top"
                    onChange={() => setSlideoutScrollable(!slideoutScrollable)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutCancel}
                    label="Show Cancel"
                    labelPlacement="top"
                    onChange={() => setSlideoutCancel(!slideoutCancel)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutMainAction}
                    label="Show Main Button"
                    labelPlacement="top"
                    onChange={() => setSlideoutMainAction(!slideoutMainAction)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutSecondaryAction}
                    label="Show Secondary Action Button"
                    labelPlacement="top"
                    onChange={() => setSlideoutSecondaryAction(!slideoutSecondaryAction)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={slideoutOptionalNode}
                    label="Show optional node"
                    labelPlacement="top"
                    onChange={() => setSlideoutOptionalNode(!slideoutOptionalNode)}
                  />
                </li>
              </ul>
            </div>
            <br />
            <ButtonMain label="Open slideout" onClick={() => setOpenSlideout(true)} />
            {openSlideout &&
              <Slideout
                cancelProps={{
                  size: 'small',
                }}
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
                contentScrollable={slideoutScrollable}
                footer={slideoutFooter}
                mainActionButton={slideoutMainAction && <ButtonMain label="Main content" size="small" />}
                optionalNode={slideoutOptionalNode && <SwitchComponent label="Optional Node label" />}
                secondaryActionButton={slideoutSecondaryAction && <ButtonMain label="Secondary content" size="small" />}
                showCancel={slideoutCancel}
                title={slideoutTitle || 'Placeholder Title'}
                onClose={setOpenSlideout}
              />
            }
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'errors') &&
        <section>
          <h6>Errors</h6>
          <div className={styles.componentWrapper}>
            <div className={cx('typography-subtitle2', [styles.componentName])}>
              Trigger Sentry error
            </div>
            <div className={styles.componentInlineVariants}>
              <ButtonMain disabled={buttonDisabled} label="Trigger Sentry" size={buttonSize} theme={buttonTheme} variant={buttonVariant} onClick={generateUncaughtError} />
              <ButtonMain disabled={buttonDisabled} label="Sentry manual error" size={buttonSize} theme={buttonTheme} variant={buttonVariant} onClick={generateManualError} />
            </div>
          </div>
        </section>
      }
      { (!selectedCategory || selectedCategory === 'charts') &&
        <section>
          <h6>Charts</h6>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                StackedBarChartWidget
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/design/82Go6q0krKApn1L8EQ2joj/Dashboard?node-id=186-5696&node-type=symbol"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={stackedBarChartEmptySection}
                    label="Empty section"
                    labelPlacement="top"
                    onChange={() => setStackedBarChartEmptySection(!stackedBarChartEmptySection)}
                  />
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants}>
              <StackedBarChartWidget
                data={stackedBarChartData}
                title="Stacked Bar Chart"
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                TimelineWidget
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/design/82Go6q0krKApn1L8EQ2joj/Dashboard?node-id=186-5696&node-type=symbol"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
            </div>
            <div className={styles.componentInlineVariants}>
              <TimelineWidget
                areaColor="red"
                data={[
                  { value: 20, date: '2024-06-03' },
                  { value: 40, date: '2024-06-05' },
                  { value: 30, date: '2024-06-07' },
                  { value: 35, date: '2024-06-09' },
                  { value: 50, date: '2024-06-11' },
                  { value: 16, date: '2024-06-13' },
                  { value: 64, date: '2024-06-15' },
                  { value: 20, date: '2024-06-17' },
                  { value: 37, date: '2024-06-19' },
                  { value: 29, date: '2024-06-21' },
                  { value: 18, date: '2024-06-23' },
                  { value: 27, date: '2024-06-25' },
                  { value: 35, date: '2024-06-27' },
                  { value: 10, date: '2024-06-29' },
                ]}
                lineColor="purple"
                title="Title Goes Here"
                tooltipFormatter={value => [`• ${value} conversations`]}
                width="100%"
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                VerticalBarChartWidget
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/design/82Go6q0krKApn1L8EQ2joj/Dashboard?node-id=186-5696&node-type=symbol"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Sample Dataset"
                    value={sampleDataSet}
                    onChange={e => setSampleDataSet(e.target.value)}
                  >
                    <option value="design">Design</option>
                    <option value="statuses">Statuses</option>
                  </Select>
                </li>
              </ul>
            </div>
            <div className={styles.componentInlineVariants} style={{ backgroundColor: buttonTheme === 'white' ? 'var(--color-gray-15)' : null }}>
              <VerticalBarChartWidget
                data={verticalBarChartData[sampleDataSet]}
                title="Media Received"
                width="100%"
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                NumberWidget
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/82Go6q0krKApn1L8EQ2joj?type=design&node-id=188%3A12213&mode=design"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <SwitchComponent
                    checked={numberWidgetUnit}
                    label="Unit"
                    labelPlacement="top"
                    onChange={() => setNumberWidgetUnit(!numberWidgetUnit)}
                  />
                </li>
                <li>
                  <SwitchComponent
                    checked={numberWidgetContextText}
                    label="Context"
                    labelPlacement="top"
                    onChange={() => setNumberWidgetContextText(!numberWidgetContextText)}
                  />
                </li>
                <li>
                  <Select
                    label="Item Count"
                    value={numberWidgetItemCount}
                    onChange={e => setNumberWidgetItemCount(e.target.value)}
                  >
                    <option value="2024">2024</option>
                    <option value="0">0</option>
                    <option value="null">null</option>
                  </Select>
                </li>
                <li>
                  <Select
                    label="Background Color"
                    value={numberWidgetBackgroundColor}
                    onChange={e => setNumberWidgetBackgroundColor(e.target.value)}
                  >
                    <option value="var(--color-pink-93)">pink-93 (default)</option>
                    <option value="var(--color-yellow-79)">yellow-79</option>
                    <option value="var(--color-purple-92)">purple-92</option>
                    <option value="var(--color-green-82)">green-82</option>
                  </Select>
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <NumberWidget
                color={numberWidgetBackgroundColor}
                contextText={numberWidgetContextText ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris feugiat pharetra condimentum. Fusce convallis tincidunt sem, tempus convallis sapien eleifend vitae.' : null}
                itemCount={numberWidgetItemCount}
                title="Title"
                unit={numberWidgetUnit ? 'unit' : null}
              />
            </div>
          </div>
          <div className={styles.componentWrapper}>
            <div className={styles.componentControls}>
              <div className={cx('typography-subtitle2', [styles.componentName])}>
                ListWidget
                <a
                  className={styles.figmaLink}
                  href="https://www.figma.com/file/82Go6q0krKApn1L8EQ2joj?type=design&node-id=188%3A11014&mode=design"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Figma Designs"
                >
                  <FigmaColorLogo />
                </a>
              </div>
              <ul>
                <li>
                  <Select
                    label="Background Color"
                    value={listWidgetBackgroundColor}
                    onChange={e => setListWidgetBackgroundColor(e.target.value)}
                  >
                    <option value="var(--color-pink-93)">pink-93 (default)</option>
                    <option value="var(--color-purple-92)">purple-92</option>
                  </Select>
                </li>
              </ul>
            </div>
            <div className={styles.componentBlockVariants}>
              <ListWidget
                color={listWidgetBackgroundColor}
                items={
                  [
                    {
                      itemValue: '2024',
                      itemLink: null,
                      itemText: 'Not-Linked Tag',
                      id: 'item1',
                    },
                    {
                      itemValue: null,
                      itemLink: 'e.not/a/working/url/',
                      itemText: 'Should not have a link. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam varius commodo malesuada',
                      id: 'item2',
                    },
                    {
                      itemValue: '0',
                      itemLink: 'https://maze.toys/mazes/mini/daily/',
                      itemText: 'Linked Tag',
                      id: 'item3',
                    },
                    {
                      itemValue: '9423125',
                      itemLink: 'https://www.lipsum.com/feed/html',
                      itemText: 'Lorem Ipsum URL',
                      id: 'item4',
                    },
                    {
                      itemText: 'Lorem ipsum dolor sit amet',
                      id: 'item5',
                    },
                  ]
                }
                title="List Title"
              />
            </div>
          </div>
        </section>
      }
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
