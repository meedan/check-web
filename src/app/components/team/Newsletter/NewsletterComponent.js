import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { commitMutation } from 'react-relay';
import Button from '@material-ui/core/Button';
import NewsletterHeader from './NewsletterHeader';
import NewsletterStatic from './NewsletterStatic';
import NewsletterRssFeed from './NewsletterRssFeed';
import NewsletterScheduler from './NewsletterScheduler';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import styles from './NewsletterComponent.module.css';
import LanguagePickerSelect from '../../cds/forms/LanguagePickerSelect';
import SettingsHeader from '../SettingsHeader';
import { getTimeZoneOptions } from '../../../helpers';
import { can } from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';

const NewsletterComponent = ({
  environment,
  team,
  language,
  languages,
  onChangeLanguage,
  setFlashMessage,
}) => {
  const newsletters = team.tipline_newsletters?.edges;
  const newsletter = newsletters.find(item => item.node.language === language)?.node || {};
  const [file, setFile] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [articleErrors, setArticleErrors] = React.useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const {
    id,
    number_of_articles,
    introduction,
    header_type,
    header_overlay_text,
    header_file_url,
    content_type,
    first_article,
    second_article,
    third_article,
    rss_feed_url,
    send_every,
    send_on,
    timezone: send_timezone,
    time: send_time,
    enabled,
    subscribers_count,
    last_sent_at,
    last_scheduled_at,
    last_scheduled_by,
    last_delivery_error,
  } = newsletter;

  const [saving, setSaving] = React.useState(false);
  const [disableSaveNoFile, setDisableSaveNoFile] = React.useState(false);
  const [textfieldOverLength, setTextfieldOverLength] = React.useState(false);
  const [overlayText, setOverlayText] = React.useState(header_overlay_text || '');
  const [introductionText, setIntroductionText] = React.useState(introduction || '');
  const [articleNum, setArticleNum] = React.useState(number_of_articles || 0);
  const [articles, setArticles] = React.useState([first_article || '', second_article || '', third_article || '']);
  const [headerType, setHeaderType] = React.useState(header_type || 'link_preview');
  const fileNameFromUrl = new RegExp(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/);
  const [fileName, setFileName] = React.useState((header_file_url && header_file_url.match(fileNameFromUrl) && header_file_url.match(fileNameFromUrl)[0]) || '');
  const [rssFeedUrl, setRssFeedUrl] = React.useState(rss_feed_url || '');
  const [contentType, setContentType] = React.useState(content_type || 'static');
  const [sendEvery, setSendEvery] = React.useState(send_every || ['wednesday']);
  const [sendOn, setSendOn] = React.useState(send_on || null);

  // Just use the local timezone if it's one of the options
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let defaultTimezone = null;
  if (getTimeZoneOptions().find(item => item.code === localTimezone || item.value === localTimezone)) {
    defaultTimezone = localTimezone;
  }
  const [timezone, setTimezone] = React.useState(send_timezone || defaultTimezone);

  const [time, setTime] = React.useState(send_time || '09:00');
  const [scheduled, setScheduled] = React.useState(enabled || false);
  const [datetimeIsPast, setDatetimeIsPast] = React.useState(false);

  const numberOfArticles = (contentType === 'rss' && articleNum === 0) ? 1 : articleNum;
  const introductionTextMaxChars = 180;

  // This triggers when a file or file name or header type is changed. If the header is an attachment type, it disables saving if there is no file attached.
  React.useEffect(() => {
    const fileRequired = headerType === 'image' || headerType === 'audio' || headerType === 'video';
    if (file && fileRequired) {
      setDisableSaveNoFile(false);
    } else if (!file && !fileName && fileRequired) {
      setDisableSaveNoFile(true);
    } else if (!fileRequired) {
      setDisableSaveNoFile(false);
    }
  }, [file, fileName, headerType]);

  // This triggers when a file is changed. It rerenders the file name if a new file was attached.
  React.useEffect(() => {
    if (file && !fileName) {
      setFileName(file.name);
    }
  }, [file]);

  // This triggers when time or scheduled date changes. if it's a static newsletter, then we check to see if the date is in the past and set the datetimeIsPast to enable or disable scheduling.
  React.useEffect(() => {
    const errorsCopy = errors;
    if (contentType === 'static' && timezone) {
      // We have to do `new Date` twice here -- the `Date.parse` gives us a date object with no timezone associated. We wrap that in `new Date` to turn it from a string to a Date object. That object then uses `toLocaleString` to localize it to a string with the correct time derived from our `timezone` which is either `'Region/Zone'` or `'Region/Zone (GMT+xx:xx)'`, which we extract via regex. This gives us a second string, which we then convert back to Date object so we can compare it to the current unix epoch time. We specify 'en-US' for the localeString conversion since that is how the database is storing the datetime.
      const date = new Date(Date.parse(`${sendOn} ${time} +0000`));
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone.match(/^\w*\/\w*/) && timezone.match(/^\w*\/\w*/)[0] }));
      const offset = utcDate.getTime() - tzDate.getTime();
      date.setTime(date.getTime() + offset);
      const scheduledDateTime = date;
      const currentDateTime = new Date();
      if (scheduledDateTime.getTime() < currentDateTime.getTime()) {
        setDatetimeIsPast(true);
        errorsCopy.datetime_past = (<FormattedMessage
          id="newsletterComponent.errorDatetimePast"
          defaultMessage="Scheduled newsletter date cannot be in the past."
          description="Error message displayed when a user tries to schedule sending a newsletter on a past date."
        />);
      } else {
        setDatetimeIsPast(false);
        errorsCopy.datetime_past = null;
      }
    } else {
      setDatetimeIsPast(false);
      errorsCopy.datetime_past = null;
    }
    setErrors(errorsCopy);
  }, [contentType, sendOn, time, timezone]);

  const handleLanguageChange = (value) => {
    const { languageCode } = value;
    onChangeLanguage(languageCode);
  };

  const handleError = (err) => {
    setSaving(false);
    if (
      err.length &&
      err[0]?.data &&
      (
        err[0]?.data.timezone ||
        err[0]?.data.introduction ||
        err[0]?.data.rss_feed_url ||
        err[0]?.data.send_on ||
        err[0]?.data.time ||
        err[0]?.data.header_type ||
        err[0]?.data.header_file ||
        err[0]?.data.base
      )
    ) {
      const { data } = err[0];
      if (data.timezone && data.timezone[0] === 'can\'t be blank') {
        data.timezone = (
          <FormattedMessage
            id="newsletterComponent.errorTimezone"
            defaultMessage="Time zone cannot be blank."
            description="Error message displayed when a user submits a form with a blank time zone field."
          />
        );
      }
      if (data.introduction && data.introduction[0] === 'can\'t be blank') {
        data.introduction = (
          <FormattedMessage
            id="newsletterComponent.errorIntroduction"
            defaultMessage="Introduction cannot be blank."
            description="Error message displayed when a user submits a form with a blank introduction field."
          />
        );
      }
      if (data.introduction && /is too long/.test(data.introduction[0])) {
        data.introduction = (
          <FormattedMessage
            id="newsletterComponent.errorIntroductionTooLong"
            defaultMessage="Introduction is too long"
            description="Error message displayed when a user submits a form with an introduction field that is too long."
          />
        );
      }
      if (data.rss_feed_url && data.rss_feed_url[0] === 'is invalid') {
        data.rss_feed_url = (
          <FormattedMessage
            id="newsletterComponent.errorRssFeedUrl"
            defaultMessage="RSS feed URL is invalid."
            description="Error message displayed when a user submits a form with a URL that the server does not recognize."
          />
        );
      }
      if (data.send_on && data.send_on[0] === 'can\'t be blank') {
        data.send_on = (
          <FormattedMessage
            id="newsletterComponent.errorSendOn"
            defaultMessage="Scheduled date cannot be blank."
            description="Error message displayed when a user submits a form with a blank scheduled date field."
          />
        );
      }
      if (data.header_type && data.header_type[0] === 'is not included in the list') {
        data.header_type = (
          <FormattedMessage
            id="newsletterComponent.errorHeaderType"
            defaultMessage="Header type must be supplied from the list."
            description="Error message displayed when a user submits a form with a blank header type field (this is chosen from a list)."
          />
        );
      }
      if (data.header_file && data.header_file[0].includes('cannot be of type')) {
        data.header_file = (
          <FormattedMessage
            id="newsletterComponent.errorHeaderFile"
            defaultMessage="File must be of the following allowed types: {fileTypes}"
            description="Error message displayed when a user uploads a file of the wrong type. This is followed with a list of file types like 'png, jpg, jpeg, pdf'."
            values={{
              fileTypes: data.header_file[0].split(':')[1],
            }}
          />
        );
      }
      if (data.base && data.base[0].includes('Sorry, we don\'t support')) {
        // FIXME: We are not going to internationalize this string for now, it's too unstructured and variable to make work
        data.base = data.base[0]; // eslint-disable-line prefer-destructuring
      }
      setErrors(data);
    } else if (err.length && err[0]?.message) {
      setFlashMessage(err[0].message, 'error');
    } else {
      setFlashMessage((
        <FormattedMessage
          id="newsletterComponent.error"
          defaultMessage="Could not save newsletter, please try again."
          description="Error message displayed when it's not possible to save a newsletter."
        />
      ), 'error');
    }
  };

  const handleSuccess = (response) => {
    setScheduled(response?.updateTiplineNewsletter?.tipline_newsletter?.enabled);
    setSaving(false);
    setErrors({});
    setFlashMessage((
      <FormattedMessage
        id="newsletterComponent.success"
        defaultMessage="Newsletter saved successfully."
        description="Success message displayed when a newsletter is saved."
      />
    ), 'success');
  };

  // FIXME: Is there a way to write the tipline_newsletter as a fragment and reuse it in the two mutation queries below?

  const updateMutation = graphql`
    mutation NewsletterComponentUpdateMutation($input: UpdateTiplineNewsletterInput!) {
      updateTiplineNewsletter(input: $input) {
        tipline_newsletter {
          id
          introduction
          language
          header_type
          header_overlay_text
          content_type
          first_article
          second_article
          third_article
          rss_feed_url
          number_of_articles
          send_every
          send_on
          timezone
          time
          enabled
          last_delivery_error
          last_scheduled_at
          last_scheduled_by {
            name
          }
        }
      }
    }
  `;

  const createMutation = graphql`
    mutation NewsletterComponentCreateMutation($input: CreateTiplineNewsletterInput!) {
      createTiplineNewsletter(input: $input) {
        team {
          id
        }
      }
    }
  `;

  const validateArticles = () => {
    // skip validation if RSS
    if (contentType === 'rss') return true;
    let isValidated = true;
    const errorArr = [];
    const blankArticleError = (<FormattedMessage
      id="newsletterComponent.articleBlank"
      defaultMessage="Article field cannot be blank"
      description="Message displayed on the article text field when it is empty and a user tries to save"
    />);
    if (numberOfArticles >= 1 && articles[0].length === 0) {
      isValidated = false;
      errorArr[0] = blankArticleError;
    }
    if (numberOfArticles >= 2 && articles[1].length === 0) {
      isValidated = false;
      errorArr[1] = blankArticleError;
    }
    if (numberOfArticles >= 3 && articles[2].length === 0) {
      isValidated = false;
      errorArr[2] = blankArticleError;
    }
    setArticleErrors(errorArr);
    return isValidated;
  };

  const handleSave = (scheduledOrPaused) => {
    setSaving(true);
    const mutation = (id ? updateMutation : createMutation);
    const input = {
      introduction: introductionText,
      language,
      header_type: headerType,
      header_overlay_text: overlayText,
      content_type: contentType,
      first_article: articles[0],
      second_article: articles[1],
      third_article: articles[2],
      rss_feed_url: rssFeedUrl,
      number_of_articles: numberOfArticles,
      send_every: sendEvery,
      timezone,
      time,
    };
    if (id) {
      input.id = id;
    }
    if (sendOn) {
      input.send_on = sendOn;
    }
    if (scheduledOrPaused === 'paused' || scheduledOrPaused === 'scheduled') {
      input.enabled = (scheduledOrPaused === 'scheduled');
    }
    const uploadables = {};
    if (file) {
      uploadables['file[]'] = file;
    }
    if (validateArticles()) {
      commitMutation(
        environment,
        {
          mutation,
          variables: {
            input,
          },
          uploadables,
          onCompleted: (response, err) => {
            if (err) {
              handleError(err);
            } else {
              handleSuccess(response);
              // FIXME: Find a better way to refresh the local store when a newsletter is created
              if (!input.id) {
                window.location.assign(`/${team.slug}/settings/newsletter`);
              }
            }
          },
          onError: (err) => {
            handleError(err);
          },
        },
      );
    } else {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = (field, value) => {
    switch (field) {
    case 'sendEvery':
      setSendEvery(value);
      break;
    case 'sendOn':
      setSendOn(value);
      break;
    case 'timezone':
      setTimezone(value);
      break;
    case 'time':
      setTime(value);
      break;
    case 'scheduled':
      if (value) {
        handleSave('scheduled');
      } else {
        handleSave('paused');
      }
      break;
    default:
      break;
    }
  };

  return (
    <div className={`newsletter-component ${styles.content}`}>
      <SettingsHeader
        helpUrl="https://help.checkmedia.org/en/articles/5540430-tipline-newsletters"
        title={
          <FormattedMessage
            id="newsletterComponent.title"
            defaultMessage="Newsletter"
            description="Title for newsletter settings page."
          />
        }
        extra={
          languages.length > 1 ?
            <LanguagePickerSelect
              selectedLanguage={language}
              onSubmit={handleLanguageChange}
              languages={languages}
              isDisabled={saving}
            /> : null
        }
        actionButton={
          <div>
            <Button className="save-button" variant="contained" color="primary" onClick={handleSave} disabled={scheduled || saving || datetimeIsPast || disableSaveNoFile || textfieldOverLength || !can(team.permissions, 'create TiplineNewsletter')}>
              <FormattedMessage id="newsletterComponent.save" defaultMessage="Save" description="Label for a button to save settings for the newsletter" />
            </Button>
          </div>
        }
        // helpUrl="https://help.checkmedia.org/en/articles/123456" // FIXME: Add the real KB article URL here
      />
      <div className={styles.newsletter}>
        <div className={styles.settings}>
          <div className="typography-subtitle2">
            <FormattedMessage id="newsletterComponent.content" defaultMessage="Content" description="Title for newsletter content section on newsletter settings page" />
          </div>
          <NewsletterHeader
            className="newsletter-component-header"
            key={`newsletter-header-${language}`}
            disabled={scheduled}
            parentErrors={errors}
            file={file}
            handleFileChange={handleFileChange}
            setFile={setFile}
            setFileName={setFileName}
            availableHeaderTypes={team.available_newsletter_header_types || []}
            headerType={headerType}
            fileName={fileName}
            overlayText={overlayText}
            onUpdateField={(fieldName, value) => {
              if (fieldName === 'headerType') {
                setHeaderType(value);
              } else if (fieldName === 'overlayText') {
                setOverlayText(value);
              }
            }}
          />
          <FormattedMessage
            id="newsletterComponent.placeholder"
            defaultMessage="Example: Hello! Welcome to our newsletter. Here are the most popular fact-checks you should read now:"
            description="Placeholder text for newsletter field"
          >
            { placeholder => (
              <LimitedTextArea
                maxChars={introductionTextMaxChars}
                disabled={scheduled}
                onErrorTooLong={(error) => {
                  setTextfieldOverLength(error);
                }}
                value={introductionText}
                setValue={setIntroductionText}
                placeholder={placeholder}
                error={errors.introduction}
                helpContent={errors.introduction}
                label={<FormattedMessage
                  id="newsletterComponent.introduction"
                  defaultMessage="Introduction"
                  description="Label for a field where the user inputs text for an introduction to a newsletter"
                />}
              />
            )}
          </FormattedMessage>
          <div className={styles['newsletter-body']}>
            <div className={styles.switcher}>
              <SwitchComponent
                key={`newsletter-rss-feed-enabled-${language}`}
                label={<FormattedMessage
                  id="newsletterComponent.rss"
                  defaultMessage="RSS"
                  description="Label for a switch where the user turns on RSS (Really Simple Syndication) capability - should not be translated unless there is a local idiom for 'RSS'"
                />}
                checked={contentType === 'rss'}
                disabled={scheduled}
                onChange={(checked) => {
                  if (checked) {
                    setContentType('rss');
                  } else {
                    setContentType('static');
                  }
                }}
              />
            </div>
            <div className={`typography-body2 ${styles['text-secondary']}`}>
              <p>
                <FormattedMessage
                  id="newsletterComponent.rssFeed"
                  defaultMessage="Use an RSS feed to automatically load new content and send your newsletter on a recurring schedule. The newsletter will only be sent if new content is retrieved from the RSS."
                  description="Message on tipline newsletter settings page that explains how RSS feeds work there."
                />
              </p>
            </div>
            { contentType === 'rss' ?
              <NewsletterRssFeed
                disabled={scheduled}
                parentErrors={errors}
                helpContent={errors.rss_feed_url}
                numberOfArticles={numberOfArticles}
                onUpdateNumberOfArticles={setArticleNum}
                rssFeedUrl={rssFeedUrl}
                onUpdateUrl={setRssFeedUrl}
              /> : null }
            { contentType === 'static' ?
              <NewsletterStatic
                disabled={scheduled}
                articleErrors={articleErrors}
                numberOfArticles={numberOfArticles}
                onUpdateNumberOfArticles={setArticleNum}
                articles={articles}
                setTextfieldOverLength={setTextfieldOverLength}
                onUpdateArticles={setArticles}
              /> : null }
          </div>
          <div className={styles['newsletter-scheduler-container']}>
            <NewsletterScheduler
              type={contentType}
              sendEvery={sendEvery}
              sendOn={sendOn}
              timezone={timezone}
              time={time}
              parentErrors={errors}
              scheduled={scheduled}
              disabled={saving || (!scheduled && (disableSaveNoFile || datetimeIsPast || textfieldOverLength))}
              subscribersCount={subscribers_count}
              lastSentAt={last_sent_at}
              lastScheduledAt={last_scheduled_at}
              lastScheduledBy={last_scheduled_by?.name}
              lastDeliveryError={last_delivery_error}
              onUpdate={handleUpdateSchedule}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

NewsletterComponent.propTypes = {
  team: PropTypes.shape({
    permissions: PropTypes.string.isRequired,
    tipline_newsletters: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          language: PropTypes.string.isRequired,
          number_of_articles: PropTypes.number.isRequired,
          introduction: PropTypes.string,
          header_type: PropTypes.string,
          header_overlay_text: PropTypes.string,
          content_type: PropTypes.string,
          first_article: PropTypes.string,
          second_article: PropTypes.string,
          third_article: PropTypes.string,
          rss_feed_url: PropTypes.string,
        }),
      }).isRequired,
      ),
    }),
  }).isRequired,
  language: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeLanguage: PropTypes.func.isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { NewsletterComponent as NewsletterComponentTest };

export default createFragmentContainer(withSetFlashMessage(NewsletterComponent), graphql`
  fragment NewsletterComponent_team on Team {
    id
    slug
    permissions
    available_newsletter_header_types
    tipline_newsletters(first: 1000) {
      edges {
        node {
          id
          number_of_articles
          introduction
          header_type
          header_file_url
          header_overlay_text
          content_type
          first_article
          second_article
          third_article
          rss_feed_url
          send_every
          send_on
          time
          timezone
          subscribers_count
          last_delivery_error
          last_sent_at
          last_scheduled_at
          last_scheduled_by {
            name
          }
          enabled
          language
        }
      }
    }
  }
`);
